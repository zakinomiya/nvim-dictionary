# :book: Nvim Dictionary

A neovim dictionary plugin.

## Dependencies 

- [vim-denops/denops.vim](https://github.com/vim-denops/denops.vim)

## Tested Environment 

- NeoVim v0.6.1
- macOS Big Sur v11.3.1

Since the plugin uses neovim specific apis, it does not work in vim. 

## Notice 

This plugin is developed to just serve for my usecases, hence very limited in its functionality. 

(feature requests and pull requests will be welcomed)

## Features

### commands: 

- `NDSearch`: search definitions of a word.
- `NDCleanCache`: remove cached data.

### keymaps:

- `<Leader>d`: run `NDSearch` for the word under the cursor.


### dictionary

`NvimDictionary` uses [Free Dictionary API](https://dictionaryapi.dev/) as its source of the definitions.

### caching

`NvimDictionary` caches definitions as json file word by word in `<NVIM_STD_CACHE_DIR>/nvim-dictionary/history` when words are fetched via api for the first time. 

Since the plugin always uses cached data if the file exists, you should remove cache and run the search command again if you would like to update definition of specific words. 

`NDCleanCache` command removes the entire cache directory and at the time, the plugin does not provide functions to partially remove/update cached data. If you need to do this, you can by removing files from the cache directory manually.


