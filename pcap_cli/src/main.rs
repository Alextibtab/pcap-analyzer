use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use clap::Parser;
use pcap_core::analyze_pcap;
use pcap_core::pcap_analysis::PcapAnalysisResult;
use prettytable::{Attr, Cell, Row, Table};

/// Analyzes PCAP files
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Cli {
    /// The input PCAP file to analyze
    input: PathBuf,
}

fn main() -> Result<(), String> {
    let cli = Cli::parse();

    if !is_valid_pcap_file(&cli.input) {
        return Err("The file is not a valid PCAP or PCAPNG file.".into());
    }

    let data = fs::read(&cli.input).map_err(|e| e.to_string())?;

    // Analyze the file
    let analysis_result = analyze_pcap(&data).unwrap();

    // Print results
    print_results(&analysis_result);

    Ok(())
}

fn is_valid_pcap_file(path: &Path) -> bool {
    match path.extension() {
        Some(ext) => {
            let ext = ext.to_string_lossy().to_lowercase(); // Convert to lowercase to make the check case-insensitive
            ext == "pcap" || ext == "pcapng"
        }
        None => false, // No extension found
    }
}

fn print_results(results: &PcapAnalysisResult) {
    // Print IP addresses
    let sorted_ips = sort_hashmap(&results.ip_counts);
    print_table("IP Addresses", &sorted_ips);

    // Print layer 4 protocols
    let sorted_layer4_protocols = sort_hashmap(&results.layer_4_counts);
    print_table("Layer 4 Protocols", &sorted_layer4_protocols);

    // Print layer 7 protocols
    let sorted_layer7_protocols = sort_hashmap(&results.protocol_counts);
    print_table("Layer 7 Protocols", &sorted_layer7_protocols);

    // Print SHA hashes
    println!("\nSHA1 Hash: {}", results.sha1);
    println!("SHA256 Hash: {}", results.sha256);
}

fn sort_hashmap(map: &HashMap<String, u32>) -> Vec<(String, u32)> {
    let mut vec: Vec<_> = map.iter().collect();
    vec.sort_unstable_by(|a, b| b.1.cmp(a.1));
    vec.into_iter().map(|(k, v)| (k.clone(), *v)).collect()
}

fn print_table(title: &str, data: &Vec<(String, u32)>) {
    let mut table = Table::new();
    table.set_titles(Row::new(vec![
        Cell::new("IP Address").with_style(Attr::Bold),
        Cell::new("Count").with_style(Attr::Bold),
    ]));

    for (ip, count) in data {
        table.add_row(Row::new(vec![Cell::new(ip), Cell::new(&count.to_string())]));
    }

    println!("{}", title);
    table.printstd();
}
