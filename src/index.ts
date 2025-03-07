import { Liquid } from "liquidjs";
import * as fs from "fs";
import * as path from "path";

export interface RenderOptions {
  filters?: Record<string, (val: any) => any>;
  outputFile?: string; // Optional output file path
}

/**
 * Renders a Liquid template and optionally writes the output to a file.
 * @param template - Either a file path or a raw Liquid template string.
 * @param data - JSON object containing test data.
 * @param options - Optional settings (e.g., custom filters, output file).
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

  // Resolve file paths correctly
  if (path.extname(template) === ".liquid") {
    const resolvedPath = path.resolve(process.cwd(), template);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Template file not found: ${resolvedPath}`);
    }

    templateContent = fs.readFileSync(resolvedPath, "utf8");
  }

  try {
    const renderedOutput = await engine.parseAndRender(templateContent, data);

    // If an output file path is provided, write the file
    if (options.outputFile) {
      const outputPath = path.resolve(process.cwd(), options.outputFile);
      fs.writeFileSync(outputPath, renderedOutput, "utf8");
      console.log(`Rendered output saved to: ${outputPath}`);
    }

    return renderedOutput;
  } catch (error: any) {
    throw new Error(`Liquid rendering error: ${error.message}`);
  }
}