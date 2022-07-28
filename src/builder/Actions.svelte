<script lang="ts">
  import utf8 from "utf8";
  import base64 from "base-64";

  import * as GOBL from "../lib/gobl";
  import { iconButtonClasses } from "../ui/iconButtonClasses";
  import Modal from "../ui/Modal.svelte";
  import ModalBackdrop from "../ui/ModalBackdrop.svelte";

  import { keypair, editor, envelope, goblError, GOBLError } from "./stores";
  import { createNotification, Severity } from "./notifications";
  import ClearEditor from "./ClearEditor.svelte";
  import ExportDoc from "./ExportDoc.svelte";

  let buildable = false;

  editor.subscribe((value) => {
    try {
      JSON.parse(value);
      buildable = true;
    } catch (e) {
      buildable = false;
    }
  });

  $: buildEnabled = Boolean($keypair) && buildable;

  function encodeUTF8ToBase64(value: string): string {
    return base64.encode(utf8.encode(value));
  }

  const goblErrorRegexp = /^code=(\d+), message=(.+)$/;

  function parseGOBLError(err: string): GOBLError {
    const result = err.match(goblErrorRegexp);
    return {
      message: result[2] || err,
      code: +result[1] || 0,
    };
  }

  async function handleBuildClick() {
    if (!buildEnabled) {
      return;
    }

    let envelopeValue = $envelope;

    try {
      if (!envelopeValue) {
        // If no envelope exists yet, create one with the current editor
        // contents.
        const result = await GOBL.envelop({
          payload: {
            data: encodeUTF8ToBase64($editor),
            privatekey: $keypair.private,
            draft: true,
          },
          indent: true,
        });
        envelopeValue = JSON.parse(result);
      } else {
        // If envelope already exists, replace the `doc` property with the
        // current editor contents.
        envelopeValue.doc = JSON.parse($editor);

        const payload = {
          data: encodeUTF8ToBase64(JSON.stringify(envelopeValue)),
          privatekey: $keypair.private,
          draft: true,
        };

        // Do a "build" operation with the updated envelope.
        const result = await GOBL.build({ payload, indent: true });
        envelopeValue = JSON.parse(result);
      }

      envelope.set(envelopeValue);
      editor.set(JSON.stringify(envelopeValue.doc, null, 4));

      goblError.set(null);
      createNotification({
        severity: Severity.Success,
        message: "Document successfully built.",
      });
    } catch (e) {
      goblError.set(parseGOBLError(e));
    }
  }

  function handleClearEditor() {
    if ($editor === "") {
      return;
    }

    const modal = new Modal({
      target: document.body,
      props: {
        title: "Clear editor?",
        content: ClearEditor,
      },
    });
    const backdrop = new ModalBackdrop({
      target: document.body,
    });

    function destroyModal() {
      modal.$destroy();
      backdrop.$destroy();
    }

    modal.$set({
      contentProps: {
        onClose: destroyModal,
        onClearEditor: () => {
          editor.set("");
          envelope.set(null);

          modal.$destroy();
          backdrop.$destroy();
        },
      },
    });

    modal.$on("close", destroyModal);
  }
</script>

<div class="flex">
  <div>
    <div
      id="tooltip-clear-editor"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
    >
      Clear the editor.
      <div class="tooltip-arrow" data-popper-arrow />
    </div>
    <button
      data-tooltip-target="tooltip-clear-editor"
      on:click={handleClearEditor}
      class={iconButtonClasses($editor === "")}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
  <ExportDoc />
  <div>
    <div
      id="tooltip-build"
      role="tooltip"
      class="inline-block absolute invisible z-10 py-1 px-2 text-xs text-white bg-gray-900 rounded-lg shadow-sm opacity-0 transition-opacity duration-300 tooltip"
    >
      {#if buildEnabled}
        Build the GOBL document.
      {:else}
        To build, first ensure the document is valid.
      {/if}
      <div class="tooltip-arrow" data-popper-arrow />
    </div>
    <button class={iconButtonClasses(!buildEnabled)} on:click={handleBuildClick} data-tooltip-target="tooltip-build">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</div>
