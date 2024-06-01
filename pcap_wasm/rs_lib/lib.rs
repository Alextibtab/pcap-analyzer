use std::collections::HashMap;

use pcap_core::{analyze_pcap, pcap_analysis::{Connection, PcapAnalysisResult}};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
struct SerdeConnection {
    src_ip: String,
    dst_ip: String,
    count: u32,
}

#[derive(Serialize, Deserialize)]
struct SerdePcapAnalysisResult {
    ip_counts: HashMap<String, u32>,
    layer_4_counts: HashMap<String, u32>,
    protocol_counts: HashMap<String, u32>,
    connections: Vec<SerdeConnection>,
    sha1: String,
    sha256: String,
}

impl From<Connection> for SerdeConnection {
    fn from(conn: Connection) -> Self {
        SerdeConnection {
            src_ip: conn.src_ip,
            dst_ip: conn.dst_ip,
            count: conn.count,
        }
    }
}

impl From<PcapAnalysisResult> for SerdePcapAnalysisResult {
    fn from(result: PcapAnalysisResult) -> Self {
        SerdePcapAnalysisResult {
            ip_counts: result.ip_counts,
            layer_4_counts: result.layer_4_counts,
            protocol_counts: result.protocol_counts,
            connections: result.connections.into_iter().map(SerdeConnection::from).collect(),
            sha1: result.sha1,
            sha256: result.sha256,
        }
    }
}

#[wasm_bindgen]
pub fn analyze_pcap_data(data: &[u8]) -> JsValue {
    match analyze_pcap(data) {
        Ok(analysis_result) => {
            let local_result: SerdePcapAnalysisResult = analysis_result.into();
            serde_wasm_bindgen::to_value(&local_result).unwrap_or(JsValue::NULL)
        },
        Err(_) => JsValue::NULL,
    }
}
