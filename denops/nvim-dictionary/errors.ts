export class NvimDictBaseError {
  text: string;

  constructor(
    public name: string,
    public message: string,
  ) {
    this.text = `name=${this.name}, message=${this.message}`;
  }
}

export class NotFoundError extends NvimDictBaseError {
  constructor(public word: string) {
    super(
      "NotFoundError",
      "word not found in the dictionary",
    );
    this.text = `${this.text}, word=${word}`;
  }
}

export class UnknownError extends NvimDictBaseError {
  constructor(public cause?: string) {
    super(
      "UnknownError",
      "some unknown error happend",
    );
    this.text = `${this.text}, word=${cause}`;
  }
}
