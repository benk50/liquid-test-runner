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
  
  // If the input looks like a file path, resolve it
  if (path.extname(template) === ".liquid") {
    const resolvedPath = path.resolve(process.cwd(), template);
    
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Template file not found: ${resolvedPath}`);
    } 
    templateContent = fs.readFileSync(resolvedPath, "utf8");
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