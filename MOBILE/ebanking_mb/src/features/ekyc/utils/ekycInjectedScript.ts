/**
 * eKYC Injected JavaScript
 * Script to auto-start eKYC and hide introduction page
 */

export const getEKYCInjectedScript = (): string => {
  return `
    (function() {
      // Ẩn toàn bộ trang ngay lập tức
      document.documentElement.style.display = 'none';
      document.body.style.display = 'none';

      // Ẩn scrollbar hoàn toàn
      const style = document.createElement('style');
      style.textContent = \`
        body, html {
          overflow: hidden !important;
          -webkit-overflow-scrolling: touch;
        }
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      \`;
      document.head.appendChild(style);

      // Tự động click nút Init Ekyc sau khi trang load
      let retryCount = 0;
      const maxRetries = 10;

      const autoClick = () => {
        console.log('🎯 Attempting to auto-start eKYC... (attempt ' + (retryCount + 1) + ')');
        console.log('📄 Document ready state:', document.readyState);
        console.log('🔍 Current URL:', window.location.href);

        // Tìm button Init Ekyc với nhiều cách
        const buttons = document.querySelectorAll('button');
        console.log('🔘 Found ' + buttons.length + ' buttons on page');

        let initBtn = null;

        for (let btn of buttons) {
          const text = btn.textContent || '';
          console.log('  - Button text:', text);
          if (text.includes('Init') || text.includes('Ekyc')) {
            initBtn = btn;
            console.log('✅ Found Init button with text:', text);
            break;
          }
        }

        if (initBtn) {
          console.log('✅ Clicking Init button...');
          initBtn.click();

          // Đợi một chút rồi hiển thị lại và thông báo ready
          setTimeout(() => {
            document.documentElement.style.display = 'block';
            document.body.style.display = 'block';

            console.log('📤 Sending ekycReady message to React Native');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ekycReady'
            }));
          }, 1200);
        } else {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log('⚠️ Init button not found, retrying... (' + retryCount + '/' + maxRetries + ')');
            setTimeout(autoClick, 500);
          } else {
            console.error('❌ Failed to find Init button after ' + maxRetries + ' attempts');
            console.log('📤 Sending ekycReady anyway to show page');
            document.documentElement.style.display = 'block';
            document.body.style.display = 'block';
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ekycReady'
            }));
          }
        }
      };

      // Đợi DOM load xong
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          setTimeout(autoClick, 800);
        });
      } else {
        setTimeout(autoClick, 800);
      }
    })();
    true;
  `;
};
