// Static seed list for Phase 2. The real DB-backed selection (dedup +
// BASIC->INTERMEDIATE->ADVANCED progression via TechTopicProgress, see
// docs/DESIGN.md section 3.4) replaces this in Phase 4.
export const TECH_TOPIC_CATALOG: Record<string, string[]> = {
  "머신러닝": ["Bias-Variance", "Overfitting", "Regularization"],
  "딥러닝": ["Perceptron", "Backpropagation", "Batch Normalization", "Dropout"],
  "Computer Vision": ["CNN", "ResNet", "EfficientNet", "YOLO", "DETR", "Segmentation"],
  "LLM": ["Transformer", "Attention", "Fine-Tuning", "RAG", "Agent"],
  "MLOps": ["Docker", "Kubernetes", "CI/CD", "Monitoring"],
  "Embedded AI": ["Jetson", "TensorRT", "ONNX", "FP16", "INT8 Quantization"],
};
