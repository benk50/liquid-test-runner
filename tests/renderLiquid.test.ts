import { renderLiquid } from "../src/index";
import * as fs from "fs";
import * as path from "path";

describe("Liquid Email Template Tester", () => {
    test("Renders a Liquid template from a file", async () => {
        const templatePath = path.join(__dirname, "example.liquid");
        
        fs.writeFileSync(templatePath, "Hello, {{ customer.first_name }}!");
        
        const testData = { customer: { first_name: "Alice" } };
        const output = await renderLiquid(templatePath, testData);
        
        expect(output).toBe("Hello, Alice!");
        
        fs.unlinkSync(templatePath);
    });
    
    test("Renders an inline Liquid template", async () => {
        const template = "Order: {{ order_name }}";
        const testData = { order_name: "12345" };
        
        const output = await renderLiquid(template, testData);
        expect(output).toBe("Order: 12345");
    });
    
    test("Handles missing template files", async () => {
        const missingFile = "./does_not_exist.liquid";
        
        await renderLiquid(missingFile, {})
        .catch((error) => {
            expect(error.message).toContain(missingFile);
        });
    });
    
    
    test("Supports custom Liquid filters", async () => {
        const template = "Price: {{ price | currency }}";
        const testData = { price: 1234 };
        
        const output = await renderLiquid(template, testData, {
            filters: {
                currency: (value) => `$${(value / 100).toFixed(2)}`,
            },
        });
        
        expect(output).toBe("Price: $12.34");
    });
});
