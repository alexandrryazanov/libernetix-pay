export const generate3dsHtml = (
  URL: string,
  PaReq: string,
  MD: string,
  callback_url: string,
) => `
          <!DOCTYPE html>
          <html lang="en">
            <head><title>3D Secure Redirect</title></head>
            <body onload="document.forms[0].submit();">
              <form method="POST" action="${URL}">
                <input type="hidden" name="PaReq" value="${PaReq}" />
                <input type="hidden" name="MD" value="${MD || ''}" />
                <input type="hidden" name="TermUrl" value="${callback_url}" />
                <noscript>
                  <p>Click the button to continue</p>
                  <button type="submit">Continue</button>
                </noscript>
              </form>
            </body>
          </html>
        `;
