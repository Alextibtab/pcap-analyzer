pub mod pcap_analysis;
pub mod utils;

use pcap_analysis::{PcapAnalysis, PcapAnalysisResult, PcapError};

pub fn analyze_pcap(pcap_data: &[u8]) -> Result<PcapAnalysisResult, PcapError> {
    let mut analyser = PcapAnalysis::new();
    analyser.analyze_pcap(pcap_data)
}
