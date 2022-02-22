import { fs, path } from "./deps.ts";
import { DefinitionRecord } from "./dictionary.ts";
import { HISTORY_DIR } from "./constants.ts";

const cacheDir = path.join(Deno.cwd(), HISTORY_DIR);
const filepath = (word: string) => path.join(cacheDir, `${word}.json`);

const exists = async (word: string) => {
  try {
    await Deno.lstat(filepath(word));
    return true;
  } catch (err) {
    // assume there is no file if any type of error occurs
    return false;
  }
};

export const clean = async () => {
  await Deno.remove(cacheDir, { recursive: true });
};

export const save = async (word: string, data: DefinitionRecord[]) => {
  if (await exists(word)) {
    return;
  }

  await fs.ensureDir(cacheDir);
  await Deno.writeTextFile(filepath(word), JSON.stringify(data));
};

export const getIfExists = async (
  word: string,
): Promise<DefinitionRecord[] | null> => {
  if (!await exists(word)) {
    return null;
  }

  const json = await Deno.readTextFile(filepath(word));
  return JSON.parse(json) as DefinitionRecord[];
};
