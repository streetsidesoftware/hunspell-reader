import {expect} from 'chai';
import {IterableHunspellReader} from './IterableHunspellReader';
import * as Aff from './aff';
import {from} from 'rxjs';
import * as AffReader from './affReader';
import { genSequence } from 'gensequence';

basicReadTests();

describe('Basic Validation of the Reader', () => {
    const pSimpleAff = getSimpleAff();

    it('Validate Simple Words List', () => {
        return pSimpleAff.then(aff => {
            const src = { aff, dic: textToArray(simpleWords)};
            const reader = new IterableHunspellReader(src);
            return expect([...reader.iterateRootWords()]).to.be.deep.equal(['happy', 'ring']);
        });
    });
    it('Validate Simple Words List', () => {
        return pSimpleAff.then(aff => {
            const src = { aff, dic: (['place/AJ'])};
            const reader = new IterableHunspellReader(src);
            return expect([...reader]).to.be.deep.equal(['place', 'replace', 'replacing', 'replacings', 'placing', 'placings']);
        });
    });
});


describe('HunspellReader En', function() {
    // We are reading big files, so we need to give it some time.
    this.timeout(10000);
    const aff = __dirname + '/../dictionaries/en_US.aff';
    const dic = __dirname + '/../dictionaries/en_US.dic';
    const pReader = IterableHunspellReader.createFromFiles(aff, dic);

    it('reads dict entries', async () => {
        const reader = await pReader;
        const values = reader.dicWordsSeq()
            .skip(10000)
            .take(10)
            .toArray();
        expect(values.length).to.be.equal(10);
    });

    it('reads words with info', async () => {
        const reader = await pReader;
        const values = reader.seqWords()
            .skip(10000)
            .take(10)
            .toArray();
        expect(values.length).to.be.equal(10);
    });

    it('reads words', async () => {
        const reader = await pReader;
        const values = genSequence(reader)
            .skip(10000)
            .take(10)
            .toArray();
        expect(values.length).to.be.equal(10);
    });
});

function basicReadTests() {
    const readerTests = [
        'da_DK',
        'nl',
        'Portuguese (Brazilian)',
        'en_US',
    ];

    readerTests.forEach((hunDic: string) => {
        describe(`HunspellReader ${hunDic}`, function() {
            // We are reading big files, so we need to give it some time.
            this.timeout(10000);
            const aff = __dirname + `/../dictionaries/${hunDic}.aff`;
            const dic = __dirname + `/../dictionaries/${hunDic}.dic`;

            const pReader = IterableHunspellReader.createFromFiles(aff, dic);

            it('reads words with info', async () => {
                const reader = await pReader;
                const values = reader.seqWords()
                    .skip(200)
                    .take(200)
                    .toArray();
                expect(values.length).to.be.equal(200);
            });
        });
    });
}

// @ts-ignore
function textToArray(text: string) {
    return text.split('\n').filter(a => !!a).slice(1);
}

// @ts-ignore
function getSimpleAff() {
    const sampleAff = `
SET UTF-8
TRY esianrtolcdugmphbyfvkwzESIANRTOLCDUGMPHBYFVKWZ'
ICONV 1
ICONV ’ '
NOSUGGEST !

# ordinal numbers
COMPOUNDMIN 1
# only in compounds: 1th, 2th, 3th
ONLYINCOMPOUND c
# compound rules:
# 1. [0-9]*1[0-9]th (10th, 11th, 12th, 56714th, etc.)
# 2. [0-9]*[02-9](1st|2nd|3rd|[4-9]th) (21st, 22nd, 123rd, 1234th, etc.)
COMPOUNDRULE 2
COMPOUNDRULE n*1t
COMPOUNDRULE n*mp
WORDCHARS 0123456789

PFX A Y 1
PFX A   0     re         .

PFX I Y 1
PFX I   0     in         .

PFX U Y 1
PFX U   0     un         .

PFX X Y 1
PFX X   0     un         .
PFX X   0     re         .
PFX X   0     in         .
PFX X   0     a          .

SFX G Y 2
SFX G   e     ing        e
SFX G   0     ing        [^e]

SFX J Y 2
SFX J   e     ing/S      e
SFX J   0     ing/S      [^e]

SFX S Y 4
SFX S   y     ies        [^aeiou]y
SFX S   0     s          [aeiou]y
SFX S   0     es         [sxzh]
SFX S   0     s          [^sxzhy]

`;

    return AffReader.parseAff(from(sampleAff.split('\n')))
        .then(affInfo => new Aff.Aff(affInfo));
}

// @ts-ignore
const simpleWords = `
2
happy
ring/AUJ
`;

// cspell:ignore moderne avoir huis pannenkoek ababillar CDSG ings AUGJ aeiou sxzh sxzhy
// cspell:enableCompoundWords