import { parseArgs } from "util";

const { values } = parseArgs({
    args: Bun.argv,
    options: {
        filePath: {
            type: "string",
        },
        numDays: {
            type: "string",
        },
    },
    strict: true,
    allowPositionals: true,
});

const readFile = async () => {
    if (!values.filePath) {
        throw new Error("Please provide a file path");
    }
    const path = values.filePath;
    const fileToRead = Bun.file(path);

    const fileExists = await fileToRead.exists(); // boolean;
    if (!fileExists) {
        throw new Error("File does not exist");
    }

    return await fileToRead.text();
};

const updateDate = async () => {
    if (!values.numDays || isNaN(parseInt(values.numDays))) {
        throw new Error("Please provide a number of days to bump the date by");
    }

    const numDaysToBump = parseInt(values.numDays);
    const today = new Date();
    const bumpDate = new Date(today.setDate(today.getDate() + numDaysToBump));

    const year = bumpDate.toLocaleString("default", { year: "numeric" });
    const month = bumpDate.toLocaleString("default", { month: "2-digit" });
    const day = bumpDate.toLocaleString("default", { day: "2-digit" });

    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
};

const parseFile = async () => {
    const input = await readFile();
    const updatedDate = await updateDate();
    const data = input
        .split("\n")
        .filter(x => x.length)
        .map(line => {
            const [rest, expirePart] = line.split("expires: ");
            if (!expirePart) return rest;
            const partToReplace = expirePart.split("T")[0];

            if (!partToReplace) return;
            const newData = line.replace(partToReplace, updatedDate!);
            return newData;
        });

    return data;
};

const updateFile = async () => {
    const newFile = await parseFile();

    await Bun.write(values.filePath!, newFile.join("\n"));
};

await updateFile();
