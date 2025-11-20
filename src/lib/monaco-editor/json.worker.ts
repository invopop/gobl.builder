/**
 * Source: https://github.com/microsoft/monaco-editor/blob/35eb0efbc039827432002ccc17b120eb0874d70f/src/language/json/jsonWorker.ts
 */

import { fetchJsonSchema } from '$lib/editor/form/utils/schema'
import type * as monaco from 'monaco-editor'
import * as worker from 'monaco-editor/esm/vs/editor/editor.worker.js'
import * as jsonService from 'vscode-json-languageservice'
import { URI } from 'vscode-uri'

self.onmessage = () => {
  // ignore the first message
  worker.initialize((ctx: monaco.worker.IWorkerContext<undefined>, createData: ICreateData) => {
    return new JSONWorker(ctx, createData)
  })
}

/**
 * Adapted from
 * https://github.com/microsoft/monaco-editor/blob/35eb0efbc039827432002ccc17b120eb0874d70f/src/language/json/jsonWorker.ts.
 * This module is essentially unchanged, except for additional typings and
 * various `const` instead of `let` assignments.
 *
 * We use this custom `JSONWorker` so we can import our own up-to-date version
 * of `vscode-json-languageservice`, which has support for JSON Schema 2020-12.
 */

let defaultSchemaRequestService: ((url: string) => Promise<string>) | undefined
if (typeof fetch !== 'undefined') {
  defaultSchemaRequestService = async function (url: string) {
    return await fetchJsonSchema(url)
  }
}

interface ICreateData {
  languageId: string
  languageSettings: monaco.languages.json.DiagnosticsOptions
  enableSchemaRequest: boolean
}

class JSONWorker {
  private _ctx: monaco.worker.IWorkerContext
  private _languageService: jsonService.LanguageService
  private _languageSettings: monaco.languages.json.DiagnosticsOptions
  private _languageId: string

  constructor(ctx: monaco.worker.IWorkerContext, createData: ICreateData) {
    this._ctx = ctx
    this._languageSettings = createData.languageSettings
    this._languageId = createData.languageId
    this._languageService = jsonService.getLanguageService({
      workspaceContext: {
        resolveRelativePath: (relativePath: string, resource: string) => {
          const base = resource.substr(0, resource.lastIndexOf('/') + 1)
          return resolvePath(base, relativePath)
        }
      },
      schemaRequestService: createData.enableSchemaRequest ? defaultSchemaRequestService : undefined
    })
    this._languageService.configure(this._languageSettings)
  }

  async doValidation(uri: string): Promise<jsonService.Diagnostic[]> {
    const document = this._getTextDocument(uri)
    if (document) {
      const jsonDocument = this._languageService.parseJSONDocument(document)
      return this._languageService.doValidation(document, jsonDocument, this._languageSettings)
    }
    return Promise.resolve([])
  }
  async doComplete(
    uri: string,
    position: jsonService.Position
  ): Promise<jsonService.CompletionList | null> {
    const document = this._getTextDocument(uri)
    if (!document) {
      return null
    }
    const jsonDocument = this._languageService.parseJSONDocument(document)
    return this._languageService.doComplete(document, position, jsonDocument)
  }
  async doResolve(item: jsonService.CompletionItem): Promise<jsonService.CompletionItem> {
    return this._languageService.doResolve(item)
  }
  async doHover(uri: string, position: jsonService.Position): Promise<jsonService.Hover | null> {
    const document = this._getTextDocument(uri)
    if (!document) {
      return null
    }
    const jsonDocument = this._languageService.parseJSONDocument(document)
    return this._languageService.doHover(document, position, jsonDocument)
  }
  async format(
    uri: string,
    range: jsonService.Range | null,
    options: jsonService.FormattingOptions
  ): Promise<jsonService.TextEdit[]> {
    const document = this._getTextDocument(uri)
    if (!document) {
      return []
    }
    const textEdits = this._languageService.format(document, range! /* TODO */, options)
    return Promise.resolve(textEdits)
  }
  async resetSchema(uri: string): Promise<boolean> {
    return Promise.resolve(this._languageService.resetSchema(uri))
  }
  async findDocumentSymbols(uri: string): Promise<jsonService.SymbolInformation[]> {
    const document = this._getTextDocument(uri)
    if (!document) {
      return []
    }
    const jsonDocument = this._languageService.parseJSONDocument(document)
    const symbols = this._languageService.findDocumentSymbols(document, jsonDocument)
    return Promise.resolve(symbols)
  }
  async findDocumentColors(uri: string): Promise<jsonService.ColorInformation[]> {
    const document = this._getTextDocument(uri)
    if (!document) {
      return []
    }
    const jsonDocument = this._languageService.parseJSONDocument(document)
    const colorSymbols = this._languageService.findDocumentColors(document, jsonDocument)
    return Promise.resolve(colorSymbols)
  }
  async getColorPresentations(
    uri: string,
    color: jsonService.Color,
    range: jsonService.Range
  ): Promise<jsonService.ColorPresentation[]> {
    const document = this._getTextDocument(uri)
    if (!document) {
      return []
    }
    const jsonDocument = this._languageService.parseJSONDocument(document)
    const colorPresentations = this._languageService.getColorPresentations(
      document,
      jsonDocument,
      color,
      range
    )
    return Promise.resolve(colorPresentations)
  }
  async getFoldingRanges(
    uri: string,
    context?: { rangeLimit?: number }
  ): Promise<jsonService.FoldingRange[]> {
    const document = this._getTextDocument(uri)
    if (!document) {
      return []
    }
    const ranges = this._languageService.getFoldingRanges(document, context)
    return Promise.resolve(ranges)
  }
  async getSelectionRanges(
    uri: string,
    positions: jsonService.Position[]
  ): Promise<jsonService.SelectionRange[]> {
    const document = this._getTextDocument(uri)
    if (!document) {
      return []
    }
    const jsonDocument = this._languageService.parseJSONDocument(document)
    const ranges = this._languageService.getSelectionRanges(document, positions, jsonDocument)
    return Promise.resolve(ranges)
  }
  private _getTextDocument(uri: string): jsonService.TextDocument | null {
    const models = this._ctx.getMirrorModels()
    for (const model of models) {
      if (model.uri.toString() === uri) {
        return jsonService.TextDocument.create(
          uri,
          this._languageId,
          model.version,
          model.getValue()
        )
      }
    }
    return null
  }
}

// URI path utilities, will (hopefully) move to vscode-uri

const Slash = '/'.charCodeAt(0)
const Dot = '.'.charCodeAt(0)

function isAbsolutePath(path: string) {
  return path.charCodeAt(0) === Slash
}

function resolvePath(uriString: string, path: string): string {
  if (isAbsolutePath(path)) {
    const uri = URI.parse(uriString)
    const parts = path.split('/')
    return uri.with({ path: normalizePath(parts) }).toString()
  }
  return joinPath(uriString, path)
}

function normalizePath(parts: string[]): string {
  const newParts: string[] = []
  for (const part of parts) {
    if (part.length === 0 || (part.length === 1 && part.charCodeAt(0) === Dot)) {
      // ignore
    } else if (part.length === 2 && part.charCodeAt(0) === Dot && part.charCodeAt(1) === Dot) {
      newParts.pop()
    } else {
      newParts.push(part)
    }
  }
  if (parts.length > 1 && parts[parts.length - 1].length === 0) {
    newParts.push('')
  }
  let res = newParts.join('/')
  if (parts[0].length === 0) {
    res = '/' + res
  }
  return res
}

function joinPath(uriString: string, ...paths: string[]): string {
  const uri = URI.parse(uriString)
  const parts = uri.path.split('/')
  for (const path of paths) {
    parts.push(...path.split('/'))
  }
  return uri.with({ path: normalizePath(parts) }).toString()
}
