/**
 * eKYC Screen
 * Main screen for eKYC verification feature using native camera
 *
 * Native Flow:
 * 1. OCRMethodSelectionScreen - Choose camera or upload
 * 2. OCRCameraScreen - Capture front/back of ID card
 * 3. LivenessCameraScreen - Record video for liveness detection
 * 4. ReviewScreen - Process and submit to backend
 * 5. ResultScreen - Display results
 */

import React from 'react';
import OCRMethodSelectionScreen from '../components/OCRMethodSelectionScreen';

const EKYCScreen: React.FC = () => {
  return <OCRMethodSelectionScreen />;
};

export default EKYCScreen;
