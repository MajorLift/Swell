const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../testApp.js');
const composerObj = require('../pageObjects/ComposerObj');
const workspaceObj = require('../pageObjects/WorkspaceObj');

const { expect } = chai;

module.exports = () => {
  describe('HTTP Testing Controller', () => {
    const fillRestRequest = async (
      url,
      method,
      body = '',
      headers = [],
      cookies = []
    ) => {
      try {
        // click and check REST
        await (await composerObj.selectedNetwork).click();
        await (await app.client.$('a=REST')).click();

        // click and select METHOD if it isn't GET
        if (method !== 'GET') {
          await (await app.client.$('span=GET')).click();
          await (await app.client.$(`a=${method}`)).click();
        }

        // type in url
        await (await composerObj.url).setValue(url);

        // set headers
        headers.forEach(async ({ key, value }, index) => {
          await app.client
            .$(`//*[@id="header-row${index}"]/input[1]`)
            .setValue(key);
          await app.client
            .$(`//*[@id="header-row${index}"]/input[2]`)
            .setValue(value);
          await (await app.client.$('button=+ Header')).click();
        });

        // set cookies
        cookies.forEach(async ({ key, value }, index) => {
          await app.client
            .$(`//*[@id="cookie-row${index}"]/input[1]`)
            .setValue(key);
          await app.client
            .$(`//*[@id="cookie-row${index}"]/input[2]`)
            .setValue(value);
          await (await app.client.$('button=+ Cookie')).click();
        });

        // Add BODY as JSON if it isn't GET
        if (method !== 'GET') {
          // select body type JSON
          await (await app.client.$('span=text/plain')).click();
          await (await app.client.$('a=application/json')).click();
          // insert JSON content into body
          await composerObj.clearRestBodyAndWriteKeys(body);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const addAndSend = async () => {
      try {
        await (await composerObj.addRequestBtn).click();
        await (await workspaceObj.latestSendRequestBtn).click();
      } catch (err) {
        console.error(err);
      }
    };

    const clearAndFillTestScriptArea = async (script) => {
      try {
        // click the view tests button to reveal the test code editor
        await (await app.client.$('span=View Tests')).click();
        // set the value of the code editor to be some hard coded simple assertion tests
        await composerObj.clearTestScriptAreaAndWriteKeys(script);
      } catch (err) {
        console.error(err);
      }
    };

    afterEach('HIDE TESTS', (done) => {
      (async () => {
        await (await app.client.$('span=Hide Tests')).click();
      })();
      done();
    });

    // ==================================================================

    describe('simple assertions w/ chai.assert and chai.expect', () => {
      before('CLEAR DB', (done) => {
        chai
          .request('http://localhost:3000')
          .get('/clear')
          .end((err, res) => {
            done(); // <= Call done to signal callback end
          });
      });

      after('CLEAR DB', (done) => {
        chai
          .request('http://localhost:3000')
          .get('/clear')
          .send()
          .end((err, res) => {
            done(); // <= Call done to signal callback end
          });
      });

      it('a simple assertion (assert) should PASS when making a GET request', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script = "assert.strictEqual(3, 3, 'correct types');";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();

        const testStatus = await app.client.$('#TestResult-0-status').getText();
        expect(testStatus).to.equal('PASS');
      });

      it('a simple assertion (assert) should FAIL when making a GET request', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script = "assert.strictEqual(3, '3', 'wrong types');";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const testStatus = await app.client.$('#TestResult-0-status').getText();
        expect(testStatus).to.equal('FAIL');
      });

      it('a simple assertion (expect) should PASS when making a GET request', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script = "expect(3, 'correct types').to.equal(3);";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const testStatus = await app.client.$('#TestResult-0-status').getText();
        expect(testStatus).to.equal('PASS');
      });

      it('a simple assertion (expect) should FAIL when making a GET request', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script = "expect(3, 'correct types').to.equal('3');";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const testStatus = await app.client.$('#TestResult-0-status').getText();
        expect(testStatus).to.equal('FAIL');
      });
    });

    describe('Multiple assertion statements', () => {
      it('should handle multiple different simple assert statements', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script =
          "assert.strictEqual(3, '3', 'wrong types');\nassert.strictEqual(3, '3', 'this assert is a message');\nassert.strictEqual(3, 3, 'correct types');\nassert.strictEqual(3, 3, 'this assert is a message');";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const firstStatus = await app.client
          .$('#TestResult-0-status')
          .getText();
        const secondStatus = await app.client
          .$('#TestResult-1-status')
          .getText();
        const thirdStatus = await app.client
          .$('#TestResult-2-status')
          .getText();
        const fourthStatus = await app.client
          .$('#TestResult-3-status')
          .getText();

        expect(firstStatus).to.equal('FAIL');
        expect(secondStatus).to.equal('FAIL');
        expect(thirdStatus).to.equal('PASS');
        expect(fourthStatus).to.equal('PASS');
      });

      it('should handle multiple different simple expect statements', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script =
          "expect(3, 'wrong types').to.equal('3');\nexpect(3, 'this expect is a message').to.equal('3');\nexpect(3, 'correct types').to.equal(3);\nexpect(3, 'this expect is a message').to.equal(3);";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const firstStatus = await app.client
          .$('#TestResult-0-status')
          .getText();
        const secondStatus = await app.client
          .$('#TestResult-1-status')
          .getText();
        const thirdStatus = await app.client
          .$('#TestResult-2-status')
          .getText();
        const fourthStatus = await app.client
          .$('#TestResult-3-status')
          .getText();

        expect(firstStatus).to.equal('FAIL');
        expect(secondStatus).to.equal('FAIL');
        expect(thirdStatus).to.equal('PASS');
        expect(fourthStatus).to.equal('PASS');
      });
    });

    describe('Assertions on response object', () => {
      it('chai.assert: should be able to access the response object', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script = "assert.exists(response, 'response is object');";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();

        const testStatus = await app.client.$('#TestResult-0-status').getText();
        expect(testStatus).to.equal('PASS');
      });

      it('chai.assert: should be able to access the status code from the response object', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script =
          "assert.strictEqual(response.status, 200, 'response is 200');";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();

        const testStatus = await app.client.$('#TestResult-0-status').getText();
        expect(testStatus).to.equal('PASS');
      });

      it('chai.assert: should be able to access the cookies from the response object', async () => {
        const url = 'http://google.com';
        const method = 'GET';
        const script =
          "assert.exists(response.cookies, 'cookies exists on response object');";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const testStatus = await new Promise((resolve) => {
          setTimeout(async () => {
            const text = await app.client.$('#TestResult-0-status').getText();
            resolve(text);
          }, 500);
          // block for 500 ms since we need to wait for a response; normally test server would
          // respond fast enough since it is localhost and not a remote server
        });

        expect(testStatus).to.equal('PASS');
      });

      it('chai.assert: should be able to access the headers from the response object', async () => {
        const url = 'http://google.com';
        const method = 'GET';
        const script =
          "assert.exists(response.headers, 'headers exists on response object');";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const testStatus = await new Promise((resolve) => {
          setTimeout(async () => {
            const text = await app.client.$('#TestResult-0-status').getText();
            resolve(text);
          }, 500);
        });

        expect(testStatus).to.equal('PASS');
      });

      it('chai.expect: should be able to access the response object', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script = "expect(response, 'response exists').to.exist;";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const testStatus = await app.client.$('#TestResult-0-status').getText();
        expect(testStatus).to.equal('PASS');
      });

      it('chai.expect: should be able to access the status code from the response object', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script =
          "expect(response.status, 'response is 200').to.equal(200);";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const testStatus = await app.client.$('#TestResult-0-status').getText();
        expect(testStatus).to.equal('PASS');
      });

      it('chai.expect: should be able to access the cookies from the response object', async () => {
        const url = 'http://google.com';
        const method = 'GET';
        const script =
          "expect(response.cookies, 'cookies exists on response object').to.exist;";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();

        const testStatus = await new Promise((resolve) => {
          setTimeout(async () => {
            const text = await app.client.$('#TestResult-0-status').getText();
            resolve(text);
          }, 500);
        });

        expect(testStatus).to.equal('PASS');
      });

      it('chai.expect: should be able to access the headers from the response object', async () => {
        const url = 'http://google.com';
        const method = 'GET';
        const script =
          "expect(response.headers, 'headers exists on reponse object').to.exist;";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();

        const testStatus = await new Promise((resolve) => {
          setTimeout(async () => {
            const text = await app.client.$('#TestResult-0-status').getText();
            resolve(text);
          }, 500);
        });

        expect(testStatus).to.equal('PASS');
      });
    });

    describe('Using variables', () => {
      it('Test results do not render if JavaScript is entered but specifically not assertion tests', async () => {
        const url = 'http://localhost:3000/book';
        const method = 'GET';
        const script = "const foo = 'bar';";
        await fillRestRequest(url, method);
        await clearAndFillTestScriptArea(script);
        await addAndSend();

        await (await app.client.$('a=Tests')).click();
        const { selector } = await app.client.$('.empty-state-wrapper');
        expect(selector).to.equal('.empty-state-wrapper');
      });
    });
  });
};
