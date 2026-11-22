
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "locations.json");

const IGNORED = new Set([
    ".git",
    ".github",
    "node_modules"
]);

function humanize(value) {
    return value
        .replace(/-/g, " ")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, char => char.toUpperCase());
}

function getLocations(directory, relative = "") {
    const results = [];

    const entries = fs.readdirSync(directory, {
        withFileTypes: true
    });

    for (const entry of entries) {
        if (
            entry.name.startsWith(".") ||
            IGNORED.has(entry.name)
        ) continue;

        const absolute = path.join(directory, entry.name);
        const relativePath = path.posix.join(
            relative.replace(/\\/g, "/"),
            entry.name
        );

        if (entry.isDirectory()) {
            results.push(
                ...getLocations(absolute, relativePath)
            );

            continue;
        }

        if (entry.name.toLowerCase() !== "index.html") {
            continue;
        }

        if (!relativePath.includes("/")) {
            continue;
        }

        const folder = path.posix.dirname(relativePath);
        const segments = folder.split("/");

        const isRootCollection = segments.length === 1;

        const category = isRootCollection
            ? "locations"
            : segments[0];

        const locationSegments = isRootCollection
            ? segments
            : segments.slice(1);

        results.push({
            name: locationSegments.map(humanize).join(" — "),
            category,
            categoryLabel: humanize(category),
            path: folder,
            url: `./${folder}/`
        });
    }

    return results;
}

const locations = getLocations(ROOT);

locations.sort((a, b) => {
    const categoryOrder = a.category.localeCompare(
        b.category,
        undefined,
        { sensitivity: "base" }
    );

    return categoryOrder ||
        a.name.localeCompare(
            b.name,
            undefined,
            { sensitivity: "base" }
        );
});

fs.writeFileSync(
    OUTPUT,
    JSON.stringify(locations, null, 2) + "\n"
);

console.log(
    `Generated ${locations.length} locations across ${
        new Set(locations.map(item => item.category)).size
    } collections.`
);
