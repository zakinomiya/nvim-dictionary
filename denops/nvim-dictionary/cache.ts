import { fs, path } from "./deps.ts";
import { DefinitionRecord } from "./dictionary.ts";
import { HISTORY_DIR, PLUGIN_NAME } from "./constants.ts";

export class Cache {
  cacheDir: string;
  filepath: string;

  constructor(public baseCacheDir: string, public word: string) {
    this.cacheDir = path.join(baseCacheDir, PLUGIN_NAME, HISTORY_DIR);
    this.filepath = path.join(this.cacheDir, `${word}.json`);
  }

  exists = async () => {
    try {
      await Deno.lstat(this.filepath);
      return true;
    } catch (err) {
      // assume there is no file if any type of error occurs
      return false;
    }
  };

  clean = async () => {
    await Deno.remove(this.cacheDir, { recursive: true });
  };

  save = async (
    data: DefinitionRecord[],
  ) => {
    if (await this.exists()) {
      return;
    }

    await fs.ensureDir(this.cacheDir);
    await Deno.writeTextFile(this.filepath, JSON.stringify(data));
  };

  getIfExists = async (): Promise<DefinitionRecord[] | null> => {
    if (!await this.exists()) {
      return null;
    }

    const json = await Deno.readTextFile(this.filepath);
    return JSON.parse(json) as DefinitionRecord[];
  };
}
