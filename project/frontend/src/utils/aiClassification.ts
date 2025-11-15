interface ClassificationResult {
  wasteType: 'Organic' | 'Plastic' | 'Medical' | 'E-Waste' | 'Glass' | 'Metal' | 'Mixed';
  confidence: number;
  severity: number;
}

export const classifyWaste = async (imageFile: File): Promise<ClassificationResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock AI classification based on filename or random selection
  const wasteTypes: ClassificationResult['wasteType'][] = ['Organic', 'Plastic', 'Medical', 'E-Waste', 'Glass', 'Metal', 'Mixed'];
  
  // Simple mock logic based on file name
  const fileName = imageFile.name.toLowerCase();
  let wasteType: ClassificationResult['wasteType'];
  let confidence: number;
  
  if (fileName.includes('plastic') || fileName.includes('bottle')) {
    wasteType = 'Plastic';
    confidence = 0.92 + Math.random() * 0.06;
  } else if (fileName.includes('food') || fileName.includes('organic')) {
    wasteType = 'Organic';
    confidence = 0.88 + Math.random() * 0.08;
  } else if (fileName.includes('medical') || fileName.includes('hospital')) {
    wasteType = 'Medical';
    confidence = 0.95 + Math.random() * 0.04;
  } else if (fileName.includes('electronic') || fileName.includes('e-waste')) {
    wasteType = 'E-Waste';
    confidence = 0.90 + Math.random() * 0.07;
  } else {
    wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    confidence = 0.75 + Math.random() * 0.20;
  }
  
  // Calculate severity based on waste type and confidence
  const severityMultiplier = {
    'Medical': 0.9,
    'E-Waste': 0.85,
    'Plastic': 0.7,
    'Glass': 0.6,
    'Metal': 0.65,
    'Organic': 0.5,
    'Mixed': 0.75
  };
  
  const severity = Math.round((confidence * severityMultiplier[wasteType] * 10) * 10) / 10;
  
  return {
    wasteType,
    confidence: Math.round(confidence * 100) / 100,
    severity
  };
};