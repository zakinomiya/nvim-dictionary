import {
  anonymous,
  batch,
  bufname,
  Denops,
  fn,
  helper,
  mapping,
  nvimFn,
  option,
  unknownutil,
} from "./deps.ts";
import { DefinitionRecord, lookup } from "./dictionary.ts";
import { Cache } from "./cache.ts";
import { NvimDictBaseError } from "./errors.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async search(text: unknown) {
      unknownutil.ensureString(text);
      await run(denops, text.toLowerCase()).catch(
        async (e: NvimDictBaseError) => {
          console.log(e.text);
          await helper.echo(denops, e.message);
        },
      );
    },

    async cleanCache() {
      const cacheDir = await _cacheDir();
      const cache = new Cache(cacheDir, "");
      await cache.clean();
      await helper.echo(denops, "succesufully removed the cached data");
    },
  };

  const [id] = anonymous.add(denops, async () => {
    const text = await fn.expand(denops, "<cword>");
    unknownutil.ensureString(text);

    await run(denops, text.toLowerCase()).catch(
      async (e: NvimDictBaseError) => {
        console.log(e.text);
        await helper.echo(denops, e.message);
      },
    );
  });

  const _cacheDir = async (): Promise<string> =>
    await nvimFn.stdpath(denops, "cache") as string;

  const run = async (denops: Denops, text: string) => {
    const cacheDir = await _cacheDir();
    const cache = new Cache(cacheDir, text);

    const { data, fromCache } = await lookup(cache, text);
    await openBuffer(denops, text);
    await show(denops, data);
    if (!fromCache) {
      await cache.save(data);
    }
  };

  const show = async (denops: Denops, data: DefinitionRecord[]) => {
    await option.modifiable.setLocal(denops, true);

    const formatedText = format(data);
    await batch.batch(denops, async (denops) => {
      await nvimFn.nvim_buf_set_lines(
        denops,
        0,
        0,
        formatedText.length,
        false,
        formatedText,
      );
      await option.modifiable.setLocal(denops, false);
      await option.modified.setLocal(denops, false);
    });
  };

  // register key maps
  await batch.batch(denops, async (denops) => {
    await mapping.map(
      denops,
      "<Plug>(nvim-dictionary)",
      `<Cmd>call denops#notify("${denops.name}", "${id}", [])<CR>`,
      {
        mode: "n",
        noremap: true,
      },
    );
    await mapping.map(denops, "<Leader>d", "<Plug>(nvim-dictionary) <cword>", {
      mode: "n",
    });
  });

  await denops.cmd(
    `command! -nargs=1 NDSearch call denops#request("${denops.name}", "search", [<q-args>])`,
  );
  await denops.cmd(
    `command! -nargs=0 NDCleanCache call denops#request("${denops.name}", "cleanCache", [])`,
  );
}

const offset = (n: number) => " ".repeat(n);
const devider = (n: number) => "-".repeat(n);

const format = (data: DefinitionRecord[]): string[] => {
  const word = data[0]?.word ?? "";
  const lines = [word];

  data.forEach((d) =>
    d.meanings.map((m) => {
      lines.push(`${offset(4)}part of speach: ${m.partOfSpeech}`);
      lines.push(`${offset(4)}definitions:`);
      m.definitions.forEach((d, i) => {
        lines.push(`${offset(8)}${i + 1}: ${d.definition}`);
        if (d.synonyms && d.synonyms.length > 0) {
          lines.push(`${offset(11)}- synonyms: ${d.synonyms.join(", ")}`);
        }
        if (d.antonyms && d.antonyms.length > 0) {
          lines.push(`${offset(11)}- antonyms: ${d.antonyms.join(", ")}`);
        }
      });
      lines.push("");
    })
  );

  lines.push(devider(30));
  return lines;
};

async function openBuffer(denops: Denops, word: string): Promise<void> {
  const name = bufname.format({
    scheme: "nvimdict",
    expr: Deno.cwd(),
    params: {
      word,
    },
  });
  await denops.cmd("rightbelow 15split `=name`", { name });
}
