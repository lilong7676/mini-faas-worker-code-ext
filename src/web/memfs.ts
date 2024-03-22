/*
 * copied from https://github.com/microsoft/vscode/blob/main/extensions/typescript-language-features/src/filesystems/memFs.ts
 * @Author: lilonglong
 * @Date: 2024-03-15 24:41:23
 * @Last Modified by: lilonglong
 * @Last Modified time: 2024-03-22 10:48:31
 */

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";
import { basename, dirname } from "path-browserify";

export const scheme = "memfs";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

class MemFs implements vscode.FileSystemProvider {
  private readonly rootData: Map<string, FsEntry> = new Map();
  private readonly root = new FsEntry(this.rootData, 0, 0);

  stat(uri: vscode.Uri): vscode.FileStat {
    // console.log('stat', uri.toString());
    const entry = this.getEntry(uri);
    if (!entry) {
      throw vscode.FileSystemError.FileNotFound();
    }

    return entry;
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
    // console.log('readDirectory', uri.toString());

    const entry = this.getEntry(uri);
    if (!entry) {
      throw vscode.FileSystemError.FileNotFound();
    }

    return [...entry.contents.entries()].map(([name, entry]) => [
      name,
      entry.type,
    ]);
  }

  readFile(uri: vscode.Uri): Uint8Array {
    // console.log('readFile', uri.toString());

    const entry = this.getEntry(uri);
    if (!entry) {
      throw vscode.FileSystemError.FileNotFound();
    }

    return entry.data;
  }

  writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    {
      create,
      overwrite,
      autoCreateDir,
    }: { create: boolean; overwrite: boolean; autoCreateDir?: boolean }
  ): void {
    // console.log('writeFile', uri.toString());
    const fileName = basename(uri.path);
    const parentDirPath = `${uri.scheme}:${dirname(uri.path)}`;

    let dir;
    try {
      dir = this.getParent(uri);
    } catch (error) {
      if (error instanceof vscode.FileSystemError) {
        // 递归创建目录
        this.createDirectory(vscode.Uri.parse(parentDirPath), {
          autoCreateDir,
        });
        // 更新 dir
        dir = this.getParent(uri);
      } else {
        throw error;
      }
    }
    if (!dir) {
      throw vscode.FileSystemError.FileNotFound();
    }

    const dirContents = dir.contents;

    const time = Date.now() / 1000;
    const entry = dirContents.get(basename(uri.path));
    if (!entry) {
      if (create) {
        dirContents.set(fileName, new FsEntry(content, time, time));
        this._fireSoon({ type: vscode.FileChangeType.Created, uri });
      } else {
        throw vscode.FileSystemError.FileNotFound();
      }
    } else {
      if (overwrite) {
        entry.mtime = time;
        entry.data = content;
        this._fireSoon({ type: vscode.FileChangeType.Changed, uri });
      } else {
        throw vscode.FileSystemError.NoPermissions(
          "overwrite option was not passed in"
        );
      }
    }
  }

  rename(
    _oldUri: vscode.Uri,
    _newUri: vscode.Uri,
    _options: { overwrite: boolean }
  ): void {
    const parentEntry = this.getParent(_oldUri);
    const oldBasename = basename(_oldUri.path);
    const newBasename = basename(_newUri.path);

    const oldEntry = parentEntry.contents.get(oldBasename);

    if (oldEntry) {
      parentEntry.contents.set(newBasename, oldEntry);
      parentEntry.contents.delete(oldBasename);

      this._fireSoon(
        { type: vscode.FileChangeType.Deleted, uri: _oldUri },
        { type: vscode.FileChangeType.Created, uri: _newUri }
      );
    }
  }

  delete(uri: vscode.Uri): void {
    try {
      const dir = this.getParent(uri);
      dir.contents.delete(basename(uri.path));
      this._fireSoon({ type: vscode.FileChangeType.Deleted, uri });
    } catch (e) {}
  }

  createDirectory(
    uri: vscode.Uri,
    { autoCreateDir }: { autoCreateDir?: boolean } = { autoCreateDir: false }
  ): void {
    const scheme = uri.scheme;

    let dir;
    try {
      dir = this.getParent(uri);
    } catch (error) {
      if (autoCreateDir) {
        let node: FsEntry = this.root;
        const pathArr = uri.path.split("/");

        for (let i = 0; i < pathArr.length; i++) {
          const component = pathArr[i];
          if (!component) {
            // Skip empty components (root, stuff between double slashes,
            // trailing slashes)
            continue;
          }

          const next = node.contents.get(component);

          if (!next) {
            // not found!
            let currentPath = `${scheme}:${pathArr.slice(0, i).join("/")}`;
            const missingDirArr = pathArr.slice(i);
            missingDirArr.forEach((path) => {
              const fullPath = `${currentPath}/${path}`;
              this.createDirectory(vscode.Uri.parse(fullPath));
              currentPath += `/${path}`;
            });
            return;
          }

          node = next;
        }
      }
    }

    if (!dir) {
      throw vscode.FileSystemError.FileNotFound();
    }

    const now = Date.now() / 1000;
    dir.contents.set(basename(uri.path), new FsEntry(new Map(), now, now));
    this._fireSoon({ type: vscode.FileChangeType.Created, uri });
  }

  // 获取当前所有文件内容
  public _dump(): Record<string, string> {
    // 读取 memfs 文件内容，转换为 sandpack 接受的格式
    const rootUri = vscode.Uri.from({ scheme, path: "/" });
    const filesMap: Record<string, string> = {};

    const dump = (uri: vscode.Uri) => {
      const dirs = memFs.readDirectory(uri);
      dirs.forEach(([path, type]) => {
        const fullPath = vscode.Uri.joinPath(uri, path);
        if (type === vscode.FileType.File) {
          const content = this.readFile(fullPath);
          filesMap[fullPath.path] = textDecoder.decode(content);
        } else if (type === vscode.FileType.Directory) {
          const nextDirUri = vscode.Uri.joinPath(uri, path);
          dump(nextDirUri);
        }
      });
    };

    dump(rootUri);

    return filesMap;
  }

  private getEntry(uri: vscode.Uri): FsEntry | void {
    // TODO: have this throw FileNotFound itself?
    // TODO: support configuring case sensitivity
    let node: FsEntry = this.root;
    for (const component of uri.path.split("/")) {
      if (!component) {
        // Skip empty components (root, stuff between double slashes,
        // trailing slashes)
        continue;
      }

      if (node.type !== vscode.FileType.Directory) {
        // We're looking at a File or such, so bail.
        return;
      }

      const next = node.contents.get(component);

      if (!next) {
        // not found!
        return;
      }

      node = next;
    }
    return node;
  }

  private getParent(uri: vscode.Uri) {
    const dir = this.getEntry(uri.with({ path: dirname(uri.path) }));
    if (!dir) {
      throw vscode.FileSystemError.FileNotFound();
    }
    return dir;
  }

  // --- manage file events

  private readonly _emitter = new vscode.EventEmitter<
    vscode.FileChangeEvent[]
  >();

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
    this._emitter.event;
  private readonly watchers = new Map<string, Set<Symbol>>();
  private _bufferedEvents: vscode.FileChangeEvent[] = [];
  private _fireSoonHandle?: NodeJS.Timer;

  watch(resource: vscode.Uri): vscode.Disposable {
    if (!this.watchers.has(resource.path)) {
      this.watchers.set(resource.path, new Set());
    }
    const sy = Symbol(resource.path);
    return new vscode.Disposable(() => {
      const watcher = this.watchers.get(resource.path);
      if (watcher) {
        watcher.delete(sy);
        if (!watcher.size) {
          this.watchers.delete(resource.path);
        }
      }
    });
  }

  private _fireSoon(...events: vscode.FileChangeEvent[]): void {
    this._bufferedEvents.push(...events);

    if (this._fireSoonHandle) {
      clearTimeout(this._fireSoonHandle);
    }

    this._fireSoonHandle = setTimeout(() => {
      this._emitter.fire(this._bufferedEvents);
      this._bufferedEvents.length = 0;
    }, 5);
  }
}

class FsEntry {
  get type(): vscode.FileType {
    if (this._data instanceof Uint8Array) {
      return vscode.FileType.File;
    } else {
      return vscode.FileType.Directory;
    }
  }

  get size(): number {
    if (this.type === vscode.FileType.Directory) {
      return [...this.contents.values()].reduce(
        (acc: number, entry: FsEntry) => acc + entry.size,
        0
      );
    } else {
      return this.data.length;
    }
  }

  constructor(
    private _data: Uint8Array | Map<string, FsEntry>,
    public ctime: number,
    public mtime: number
  ) {}

  get data() {
    if (this.type === vscode.FileType.Directory) {
      throw vscode.FileSystemError.FileIsADirectory;
    }
    return <Uint8Array>this._data;
  }
  set data(val: Uint8Array) {
    if (this.type === vscode.FileType.Directory) {
      throw vscode.FileSystemError.FileIsADirectory;
    }
    this._data = val;
  }

  get contents() {
    if (this.type !== vscode.FileType.Directory) {
      throw vscode.FileSystemError.FileNotADirectory;
    }
    return <Map<string, FsEntry>>this._data;
  }
}

const memFs = new MemFs();
export default memFs;
