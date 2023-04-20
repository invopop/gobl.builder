declare namespace svelteHTML {
  // enhance elements
  // interface IntrinsicElements {
  //     'my-custom-element': { someattribute: string; 'on:event': (e: CustomEvent<any>) => void };
  // }

  // enhance attributes
  interface HTMLAttributes<T> {
    "on:hover"?: (event: CustomEvent<boolean>) => void;
    "on:clickOutside"?: (event: CustomEvent<void>) => void;
  }
}

declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onhover?: (event: CustomEvent<boolean>) => void;
    onclickOutside?: (event: CustomEvent<void>) => void;
  }
}
