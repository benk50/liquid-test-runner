import { Liquid } from "liquidjs";
import * as fs from "fs";
import * as path from "path";

export interface RenderOptions {
  filters?: Record<string, (val: any) => any>;
}

/**
 * Renders a Liquid template from a file or string with given JSON data.
 * @param template - Either a file path or a raw Liquid template string.
 * @param data - JSON object containing test data.
 * @param options - Optional settings (e.g., custom filters).
 * @returns Promise<string> - Rendered output.
 */
export async function renderLiquid(
  template: string,
  data: Record<string, any>,
  options: RenderOptions = {}
): Promise<string> {
  const engine = new Liquid();

  // Register custom filters if provided
  if (options.filters) {
    for (const [name, func] of Object.entries(options.filters)) {
      engine.registerFilter(name, func);
    }
  }

  let templateContent = template;

  // Check if template is a file path
  if (path.extname(template) === ".liquid") {
    if (!fs.existsSync(template)) {
      throw new Error(`Template file not found: ${template}`);
    }
    templateContent = fs.readFileSync(template, "utf8");
  }

  try {
    return await engine.parseAndRender(templateContent, data);
  } catch (error: any) {
    if (error instanceof Error) {
      throw new Error(`Liquid rendering error: ${error.message}`);
    }
    throw new Error(`Liquid rendering error: ${error}`);
  }
}