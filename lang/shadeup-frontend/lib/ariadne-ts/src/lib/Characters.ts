
export interface iCharacters {
  hbar: string;
  vbar: string;
  xbar: string;
  vbar_break: string;
  vbar_gap: string;

  uarrow: string;
  rarrow: string;

  ltop: string;
  mtop: string;
  rtop: string;
  lbot: string;
  rbot: string;
  mbot: string;

  lbox: string;
  rbox: string;

  lcross: string;
  rcross: string;

  underbar: string;
  underline: string;
}

export abstract class Characters {
  static unicode(): iCharacters {
    return {
      hbar: '─',
      vbar: '│',
      xbar: '┼',
      vbar_break: '·',
      vbar_gap: '⋮',
      uarrow: '▲',
      rarrow: '▶',
      ltop: '╭',
      mtop: '┬',
      rtop: '╮',
      lbot: '╰',
      mbot: '┴',
      rbot: '╯',
      lbox: '[',
      rbox: ']',
      lcross: '├',
      rcross: '┤',
      underbar: '┬',
      underline: '─',
    };
  }

  static ascii(): iCharacters {
    return {
      hbar: '-',
      vbar: '|',
      xbar: '+',
      vbar_break: '*',
      vbar_gap: ':',
      uarrow: '^',
      rarrow: '>',
      ltop: ',',
      mtop: 'v',
      rtop: '.',
      lbot: '`',
      mbot: '^',
      rbot: '\'',
      lbox: '[',
      rbox: ']',
      lcross: '|',
      rcross: '|',
      underbar: '|',
      underline: '^',
    };
  }
}
