package com.ebanking.ekycservice.service;

import com.ebanking.ekycservice.exception.EkycException;
import io.humble.video.*;
import io.humble.video.awt.MediaPictureConverter;
import io.humble.video.awt.MediaPictureConverterFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

/**
 * Service to extract frames from liveness video using Humble Video
 *
 * Humble Video is a stable, pure Java wrapper for FFmpeg
 * - No external FFmpeg installation needed
 * - More stable than JavaCV on Windows
 * - Includes native libraries
 *
 * Strategy:
 * - Extract frame at 0.5 second (best face position)
 * - Convert to high-quality JPEG
 * - Return as base64 for FPT.AI Face Match API
 */
@Service
@Slf4j
public class VideoFrameExtractorHumble {

    /**
     * Extract a frame from video file and return as base64
     *
     * Uses Humble Video - stable pure Java FFmpeg wrapper
     *
     * @param videoPath Path to video file
     * @return Base64 encoded image of extracted frame
     */
    public String extractFrameAsBase64(String videoPath) {
        Demuxer demuxer = null;
        try {
            log.info("🎬 Extracting frame from liveness video using Humble Video: {}", videoPath);

            Path videoFile = Paths.get(videoPath);
            if (!Files.exists(videoFile)) {
                throw new EkycException("Video file not found: " + videoPath);
            }

            // Open video file
            demuxer = Demuxer.make();
            demuxer.open(videoPath, null, false, true, null, null);

            // Find video stream
            int numStreams = demuxer.getNumStreams();
            int videoStreamId = -1;
            Decoder videoDecoder = null;

            for (int i = 0; i < numStreams; i++) {
                final DemuxerStream stream = demuxer.getStream(i);
                final Decoder decoder = stream.getDecoder();
                if (decoder != null && decoder.getCodecType() == MediaDescriptor.Type.MEDIA_VIDEO) {
                    videoStreamId = i;
                    videoDecoder = decoder;
                    break;
                }
            }

            if (videoStreamId == -1) {
                throw new EkycException("No video stream found in file");
            }

            // Open decoder
            videoDecoder.open(null, null);

            log.info("📊 Video info: {}x{} @ {} fps",
                    videoDecoder.getWidth(),
                    videoDecoder.getHeight(),
                    demuxer.getStream(videoStreamId).getFrameRate().getDouble());

            // Setup converter
            final MediaPictureConverter converter = MediaPictureConverterFactory.createConverter(
                    MediaPictureConverterFactory.HUMBLE_BGR_24,
                    videoDecoder.getPixelFormat(),
                    videoDecoder.getWidth(),
                    videoDecoder.getHeight());

            final MediaPicture picture = MediaPicture.make(
                    videoDecoder.getWidth(),
                    videoDecoder.getHeight(),
                    videoDecoder.getPixelFormat());

            // Read packets until we get frame around 0.5 second
            final MediaPacket packet = MediaPacket.make();
            BufferedImage image = null;
            int frameCount = 0;

            while (demuxer.read(packet) >= 0 && frameCount < 30) { // Max 30 frames (~1 second at 30fps)
                if (packet.getStreamIndex() == videoStreamId) {
                    int offset = 0;
                    int bytesRead = 0;

                    do {
                        bytesRead += videoDecoder.decode(picture, packet, offset);
                        if (picture.isComplete()) {
                            image = converter.toImage(null, picture);
                            frameCount++;

                            // Get frame around 0.5 second (frame 15 at 30fps)
                            if (frameCount >= 15) {
                                log.info("✅ Got target frame #{}", frameCount);
                                break;
                            }
                        }
                        offset += bytesRead;
                    } while (offset < packet.getSize());

                    if (frameCount >= 15)
                        break;
                }
            }

            if (image == null) {
                throw new EkycException("Failed to extract frame from video");
            }

            // Convert to JPEG and base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "jpg", baos);
            byte[] imageBytes = baos.toByteArray();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            log.info("✅ Successfully extracted frame from video");
            log.info("📊 Frame size: {} KB ({}x{}px)",
                    imageBytes.length / 1024,
                    image.getWidth(),
                    image.getHeight());

            return base64Image;

        } catch (EkycException e) {
            throw e;
        } catch (Exception e) {
            log.error("❌ Frame extraction failed: {}", e.getMessage(), e);
            throw new EkycException("Failed to extract frame from video: " + e.getMessage());
        } finally {
            // Clean up resources
            if (demuxer != null) {
                try {
                    demuxer.close();
                } catch (Exception e) {
                    log.warn("Failed to close demuxer: {}", e.getMessage());
                }
            }
        }
    }
}
