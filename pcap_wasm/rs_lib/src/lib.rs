use std::collections::HashMap;

use pcap_core::analyze_pcap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
struct LocalPcapAnalysisResult {
    ip_counts: HashMap<String, u32>,
    layer_4_counts: HashMap<String, u32>,
    protocol_counts: HashMap<String, u32>,
    sha1: String,
    sha256: String,
}

#[wasm_bindgen]
pub fn analyze_pcap_data(data: &[u8]) -> JsValue {
    let analysis_result = analyze_pcap(data).unwrap();
    let local_result = LocalPcapAnalysisResult {
        ip_counts: analysis_result.ip_counts,
        layer_4_counts: analysis_result.layer_4_counts,
        protocol_counts: analysis_result.protocol_counts,
        sha1: analysis_result.sha1.to_string(),
        sha256: analysis_result.sha256.to_string(),
    };

    serde_wasm_bindgen::to_value(&local_result).unwrap_or(JsValue::NULL)
}
