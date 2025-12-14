package com.example.auth.controller;

import com.example.auth.utils.HttpUltils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;

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
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(rssContent)));

            NodeList items = doc.getElementsByTagName("item");

            if (items == null || items.getLength() == 0) {
                return "No data found";
            }

            StringBuilder html = new StringBuilder();
            html.append("<html><head>")
                    .append("<meta name='viewport' content='width=device-width, initial-scale=1'>")
                    .append("<style>")
                    .append("body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f2f5; margin: 0; padding: 10px; color: #333; }")
                    .append(".lottery-card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; padding: 20px; overflow: hidden; }")
                    .append("h2 { color: #d32f2f; margin: 0 0 15px 0; font-size: 20px; text-align: center; border-bottom: 2px solid #fee; padding-bottom: 10px; }")
                    .append(".province-group { margin-bottom: 25px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }")
                    .append(".province-header { background-color: #d32f2f; color: white; padding: 10px; font-weight: bold; font-size: 16px; text-align: center; }")
                    .append("table { width: 100%; border-collapse: collapse; font-size: 14px; }")
                    .append("tr { border-bottom: 1px solid #eee; }")
                    .append("tr:last-child { border-bottom: none; }")
                    .append("td { padding: 8px 10px; vertical-align: middle; }")
                    .append("td.prize-name { width: 80px; font-weight: bold; color: #555; background-color: #fafafa; border-right: 1px solid #eee; }")
                    .append("td.prize-numbers { text-align: center; font-family: monospace; font-size: 16px; letter-spacing: 1px; color: #333; }")
                    .append(".giai-dac-biet td.prize-numbers { color: #d32f2f; font-weight: bold; font-size: 20px; }")
                    .append(".giai-dac-biet td.prize-name { color: #d32f2f; }")
                    .append("small { display: block; text-align: center; color: #666; margin-top: 5px; font-size: 12px; }")
                    .append("</style>")
                    .append("</head><body>");

            for (int i = 0; i < items.getLength(); i++) {
                Element item = (Element) items.item(i);
                String title = getText(item, "title");
                String desc = getText(item, "description");
                String pubDate = getText(item, "pubDate");

                html.append("<div class='lottery-card'>");
                html.append("<h2>").append(title).append("</h2>");

                html.append(parseDescriptionToHtml(desc));

                html.append("<small>Cập nhật: ").append(pubDate).append("</small>");
                html.append("</div>");
            }

            html.append("</body></html>");
            return html.toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error parsing data: " + e.getMessage();
        }
    }

    private String parseDescriptionToHtml(String description) {
        StringBuilder sb = new StringBuilder();
        String[] lines = description.split("\n");
        boolean isTableOpen = false;

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty())
                continue;

            if (line.startsWith("[") && line.endsWith("]")) {
                if (isTableOpen) {
                    sb.append("</table></div>");
                    isTableOpen = false;
                }
                String provinceName = line.substring(1, line.length() - 1);
                sb.append("<div class='province-group'>");
                sb.append("<div class='province-header'>").append(provinceName).append("</div>");
                sb.append("<table>");
                isTableOpen = true;
            } else if (line.contains(":")) {
                if (!isTableOpen) {
                    // Case for Miền Bắc or unstructured data (no province header found yet)
                    sb.append("<div class='province-group'><table>");
                    isTableOpen = true;
                }

                String[] parts = line.split(":", 2);
                String prizeName = getPrizeName(parts[0].trim());
                String numbers = parts[1].trim().replace("-", " - "); // Add spacing

                String rowClass = "";
                if (parts[0].trim().equalsIgnoreCase("ĐB") || parts[0].trim().equalsIgnoreCase("Đặc biệt")) {
                    rowClass = " class='giai-dac-biet'";
                }

                sb.append("<tr").append(rowClass).append(">");
                sb.append("<td class='prize-name'>").append(prizeName).append("</td>");
                sb.append("<td class='prize-numbers'>").append(numbers).append("</td>");
                sb.append("</tr>");
            }
        }

        if (isTableOpen) {
            sb.append("</table></div>");
        }

        return sb.toString();
    }

    private String getPrizeName(String shortName) {
        switch (shortName) {
            case "ĐB":
            case "DB":
                return "Giải Đặc Biệt";
            case "1":
                return "Giải Nhất";
            case "2":
                return "Giải Nhì";
            case "3":
                return "Giải Ba";
            case "4":
                return "Giải Tư";
            case "5":
                return "Giải Năm";
            case "6":
                return "Giải Sáu";
            case "7":
                return "Giải Bảy";
            case "8":
                return "Giải Tám";

            default:
                return shortName;
        }
    }

    private String getText(Element parent, String tag) {
        NodeList list = parent.getElementsByTagName(tag);
        if (list == null || list.getLength() == 0)
            return "";
        return list.item(0).getTextContent().trim();
    }
}