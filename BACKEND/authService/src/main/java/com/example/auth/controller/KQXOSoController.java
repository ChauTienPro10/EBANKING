package com.example.auth.controller;

import com.example.auth.utils.HttpUltils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/authService/xoso")
public class KQXOSoController {

    @Autowired
    private HttpUltils httpUltils;

    private static final String URL_MB = "https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss";
    private static final String URL_MT = "https://xskt.com.vn/rss-feed/mien-trung-xsmt.rss";
    private static final String URL_MN = "https://xskt.com.vn/rss-feed/mien-nam-xsmn.rss";

    @GetMapping("/mb")
    public ResponseEntity<String> getXSMB() {
        return fetchAndExtract(URL_MB);
    }

    @GetMapping("/mt")
    public ResponseEntity<String> getXSMT() {
        return fetchAndExtract(URL_MT);
    }

    @GetMapping("/mn")
    public ResponseEntity<String> getXSMN() {
        return fetchAndExtract(URL_MN);
    }

    private ResponseEntity<String> fetchAndExtract(String url) {
        try {
            String rssContent = httpUltils.get(url, String.class);
            String htmlContent = extractDescription(rssContent);
            return ResponseEntity.ok(htmlContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error fetching lottery data: " + e.getMessage());
        }
    }

    private String extractDescription(String rssContent) {
        if (rssContent == null)
            return "";
        // Regex to extract content inside <description><![CDATA[ ... ]]></description>
        // Adjust regex based on actual RSS format if needed.
        // Commonly it's inside <item><description>...</description></item>
        // But often the main description or first item description contains the table.

        // Let's try to find the first <description> block inside an <item>
        // or just the first CDATA inside a description if structure is simple.

        Pattern pattern = Pattern.compile("<description><!\\[CDATA\\[(.*?)\\]\\]></description>", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(rssContent);

        // Usually the first description is channel description, second is item
        // description (which has the result table)
        if (matcher.find()) {
            // Skip channel description if it doesn't contain table, typically we want the
            // one in <item>
            // Let's try to find the one that looks like a table or check multiple matches.

            // If we just loop through matches:
            do {
                String content = matcher.group(1);
                if (content.contains("<table")) {
                    return formatHtml(content);
                }
            } while (matcher.find());
        }

        return "No data found";
    }

    private String formatHtml(String content) {
        // Add basic styling to make it look decent on mobile/webview
        String style = "<style>" +
                "table { width: 100%; border-collapse: collapse; }" +
                "th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }" +
                "th { background-color: #f2f2f2; }" +
                "img { max-width: 100%; height: auto; }" +
                "</style>";
        return "<html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" + style
                + "</head><body>" + content + "</body></html>";
    }

}
