
export class Reader {
    constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0;

        // Ensure the buffer has the correct signature
        const signature = this.buffer.toString('utf8', 0, 3);
        if (signature !== 'ERI') {
            throw new Error('Invalid signature');
        }
        this.offset += 3;

        // Read the number of entries and embedding size
        this.numEntries = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;

        this.embeddingSize = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
    }

    // Method to extract only the embeddings
    extractEmbeddings() {
        const embeddings = [];

        // Read embeddings for each entry
        for (let i = 0; i < this.numEntries; i++) {
            const embedding = [];
            for (let j = 0; j < this.embeddingSize; j++) {
                embedding.push(this.buffer.readFloatLE(this.offset));
                this.offset += 4;
            }
            embeddings.push(embedding);
        }

        // After extracting embeddings, the offset will now point to the strings
        return embeddings;
    }

    // Method to extract only the resource strings
    extractStrings() {
        const strings = [];

        // Skip over the embeddings if they haven't been read yet
        this.skipEmbeddings();

        // Read strings for each entry
        for (let i = 0; i < this.numEntries; i++) {
            const stringLength = this.buffer.readUInt32LE(this.offset);
            this.offset += 4;

            const resourceString = this.buffer.toString('utf8', this.offset, this.offset + stringLength);
            this.offset += stringLength;

            strings.push(resourceString);
        }

        return strings;
    }

    // Method to extract both embeddings and resource strings
    extractAll() {
        const embeddings = this.extractEmbeddings();
        const strings = this.extractStrings();

        const result = [];
        for (let i = 0; i < this.numEntries; i++) {
            result.push({
                embedding: embeddings[i],
                resourceString: strings[i],
            });
        }

        return result;
    }

    // Helper method to skip the embeddings section if you only want to read strings
    skipEmbeddings() {
        // Skip over embeddings if the offset is at the start of the embeddings section
        if (this.offset < 11 + (this.numEntries * this.embeddingSize * 4)) {
            this.offset = 11 + (this.numEntries * this.embeddingSize * 4);
        }
    }
}

export async function writeToBuffer(values, embeddingSize) {
    const bufferSize = (
        11 + // header
        (values.length * embeddingSize * 4) + // embeddings
        values.reduce((acc, curr) => acc + Buffer.byteLength(curr.resourceString, 'utf8') + 4, 0) // strings
    );
    const buffer = Buffer.alloc(bufferSize);

    let offset = 0;
    buffer.write('ERI', 0, 'utf8'); // Signature
    offset += 3;

    buffer.writeUInt32LE(values.length, offset); // Number of entries
    offset += 4;

    buffer.writeUInt32LE(embeddingSize, offset); // Embedding size
    offset += 4;

    // Write embeddings
    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < embeddingSize; j++) {
            buffer.writeFloatLE(values[i].embedding[j], offset);
            offset += 4;
        }
    }

    // Write strings
    for (let i = 0; i < values.length; i++) {
        const stringLength = Buffer.byteLength(values[i].resourceString, 'utf8');
        buffer.writeUInt32LE(stringLength, offset);
        offset += 4;

        buffer.write(values[i].resourceString, offset, 'utf8');
        offset += stringLength;
    }

    return buffer;    
}
