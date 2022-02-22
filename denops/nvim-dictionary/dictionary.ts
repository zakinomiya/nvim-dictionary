import { API_ENDPOINT } from "./constants.ts";
import { NotFoundError, UnknownError } from "./errors.ts";
import { getIfExists } from "./cache.ts";

type Definition = {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
};

type Meaning = {
  partOfSpeech: string;
  definitions: Definition[];
};

type Phonetic = {
  text: string;
  audio?: string;
};

export type DefinitionRecord = {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  origin: string;
  meanings: Meaning[];
};

const makeUrl = (word: string) => `${API_ENDPOINT}/${word}`;

export async function lookup(
  word: string,
): Promise<{
  data: DefinitionRecord[];
  fromCache: boolean;
}> {
  const cache = await getIfExists(word);
  if (cache != null) {
    return {
      data: cache,
      fromCache: true,
    };
  }

  const url = makeUrl(word);
  const res = await fetch(url);

  switch (res.status) {
    case 200: {
      return { data: await res.json() as DefinitionRecord[], fromCache: false };
    }
    case 404: {
      throw new NotFoundError(word);
    }
    default: {
      throw new UnknownError(await res.text());
    }
  }
}
