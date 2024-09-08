import { expect } from 'chai';
import { Reader } from '../src/index.mjs'; // Use .js extension for ESM


function expectArraysToBeCloseTo(actual, expected, tolerance = 0.0001) {
    expect(actual.length).to.equal(expected.length); // Vérifie que les tableaux ont la même taille
    actual.forEach((val, index) => {
        expect(val).to.be.closeTo(expected[index], tolerance);
    });
}

// Helper to generate a binary buffer for testing
function createTestBuffer() {
    const values = [
        { resourceString: 'Hello', embedding: [1.1, 2.2, 3.3] },
        { resourceString: 'World', embedding: [4.4, 5.5, 6.6] },
    ];
    const embeddingSize = values[0].embedding.length;
    const bufferSize = (
        11 + (values.length * embeddingSize * 4) + // Embeddings
        values.reduce((acc, curr) => acc + Buffer.byteLength(curr.resourceString, 'utf8') + 4, 0) // Strings
    );
    const buffer = Buffer.alloc(bufferSize);

    let offset = 0;
    buffer.write('ERI', 0, 'utf8');
    offset += 3;

    buffer.writeUInt32LE(values.length, offset);
    offset += 4;

    buffer.writeUInt32LE(embeddingSize, offset);
    offset += 4;

    // Write embeddings
    for (let i = 0; i < values.length; i++) {
        for (let j = 0; j < embeddingSize; j++) {
            buffer.writeFloatLE(values[i].embedding[j], offset);
            offset += 4;
        }
    }

    // Write resource strings
    for (let i = 0; i < values.length; i++) {
        const stringLength = Buffer.byteLength(values[i].resourceString, 'utf8');
        buffer.writeUInt32LE(stringLength, offset);
        offset += 4;
        buffer.write(values[i].resourceString, offset, 'utf8');
        offset += stringLength;
    }

    return buffer;
}

describe('Reader class', () => {
    let buffer;

    beforeEach(() => {
        // Create a fresh buffer before each test
        buffer = createTestBuffer();
    });

    it('should extract only embeddings', () => {
        const reader = new Reader(buffer);
        const embeddings = reader.extractEmbeddings();

        expect(embeddings).to.be.an('array').with.lengthOf(2);
        expectArraysToBeCloseTo(embeddings[0], [1.1, 2.2, 3.3]);
        expectArraysToBeCloseTo(embeddings[1], [4.4, 5.5, 6.6]);
    });

    it('should extract only resource strings', () => {
        const reader = new Reader(buffer);
        const resourceStrings = reader.extractStrings();

        expect(resourceStrings).to.be.an('array').with.lengthOf(2);
        expect(resourceStrings[0]).to.equal('Hello');
        expect(resourceStrings[1]).to.equal('World');
    });

    it('should extract both embeddings and resource strings', () => {
        const reader = new Reader(buffer);
        const data = reader.extractAll();

        expect(data).to.be.an('array').with.lengthOf(2);
        expectArraysToBeCloseTo(data[0].embedding, [1.1, 2.2, 3.3]);
        expectArraysToBeCloseTo(data[1].embedding, [4.4, 5.5, 6.6]);

    });

    it('should throw an error for invalid signature', () => {
        const invalidBuffer = Buffer.from('XYZ' + buffer.slice(3).toString('binary'), 'binary');
        expect(() => new Reader(invalidBuffer)).to.throw('Invalid signature');
    });
});

