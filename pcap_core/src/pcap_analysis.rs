use std::collections::HashMap;

use pcap_parser::{create_reader, Block, PcapBlockOwned};
use pnet::packet::{
    ethernet::{EtherType, EthernetPacket},
    ip::IpNextHeaderProtocols,
    ipv4::Ipv4Packet,
    ipv6::Ipv6Packet,
    tcp::TcpPacket,
    udp::UdpPacket,
    Packet,
};
use sha1::{Digest, Sha1};
use sha2::Sha256;

use crate::utils::{get_tcp_service, get_udp_service, update_map};

#[derive(Clone)]
pub struct Connection {
    pub src_ip: String,
    pub dst_ip: String,
    pub count: u32,
}

pub struct PcapAnalysis {
    pub ip_counts: HashMap<String, u32>,
    pub layer_4_counts: HashMap<String, u32>,
    pub protocol_counts: HashMap<String, u32>,
    pub connections: HashMap<(String, String), Connection>,
    pub sni_stats: HashMap<String, u32>,
    pub http_hostnames: HashMap<String, u32>,
    pub user_agents: HashMap<String, u32>,
    pub dns_queries: HashMap<String, u32>,
    sha1: Sha1,
    sha256: Sha256,
}

#[derive(Debug)]
pub enum PcapError {
    ParseError(String),
    OtherError(String),
}

pub struct PcapAnalysisResult {
    pub ip_counts: HashMap<String, u32>,
    pub layer_4_counts: HashMap<String, u32>,
    pub protocol_counts: HashMap<String, u32>,
    pub connections: Vec<Connection>,
    pub sni_stats: HashMap<String, u32>,
    pub http_hostnames: HashMap<String, u32>,
    pub user_agents: HashMap<String, u32>,
    pub dns_queries: HashMap<String, u32>,
    pub sha1: String,
    pub sha256: String,
}

impl PcapAnalysis {
    pub fn new() -> Self {
        PcapAnalysis {
            ip_counts: HashMap::new(),
            layer_4_counts: HashMap::new(),
            protocol_counts: HashMap::new(),
            connections: HashMap::new(),
            sni_stats: HashMap::new(),
            http_hostnames: HashMap::new(),
            user_agents: HashMap::new(),
            dns_queries: HashMap::new(),
            sha1: Sha1::new(),
            sha256: Sha256::new(),
        }
    }

    fn update(&mut self, data: &[u8]) {
        self.sha1.update(data);
        self.sha256.update(data);
    }

    pub fn analyze_pcap(&mut self, data: &[u8]) -> Result<PcapAnalysisResult, PcapError> {
        self.update(data);

        self.analyze(data);

        let connections = self.connections.values().cloned().collect();
        
        Ok(PcapAnalysisResult {
            ip_counts: self.ip_counts.clone(),
            layer_4_counts: self.layer_4_counts.clone(),
            protocol_counts: self.protocol_counts.clone(),
            connections,
            sni_stats: self.sni_stats.clone(),
            http_hostnames: self.http_hostnames.clone(),
            user_agents: self.user_agents.clone(),
            dns_queries: self.dns_queries.clone(),
            sha1: format!("{:x}", self.sha1.finalize_reset()),
            sha256: format!("{:x}", self.sha256.finalize_reset()),
        })
    }

    fn analyze(&mut self, data: &[u8]) {
        let mut reader = create_reader(65536, data).expect("Failed to create reader");

        let header_block = reader.next();
        match header_block {
            Ok((sz, PcapBlockOwned::LegacyHeader(_))) => {
                reader.consume(sz);
            }
            Ok((sz, PcapBlockOwned::NG(Block::SectionHeader(_)))) => {
                reader.consume(sz);
            }
            _ => {
                eprintln!("Error: Invalid pcap file");
                return;
            }
        }

        loop {
            match reader.next() {
                Ok((sz, packet)) => {
                    self.parse_block(&packet);
                    reader.consume(sz);
                }
                Err(pcap_parser::PcapError::Eof) => break,
                Err(pcap_parser::PcapError::Incomplete(_)) => {
                    reader.refill().unwrap();
                    continue;
                }
                Err(e) => {
                    eprintln!("Error: {:?}", e);
                    break;
                }
            }
        }
    }

    fn parse_block(&mut self, block: &PcapBlockOwned) {
        match block {
            // Match legacy pcap format and NG format skip non packets
            PcapBlockOwned::NG(Block::EnhancedPacket(epb)) => {
                let data = epb.data;
                self.parse_packet(data);
            }
            PcapBlockOwned::Legacy(ref block) => {
                let data = block.data;
                self.parse_packet(data);
            }
            _ => {}
        }
    }

    fn parse_packet(&mut self, data: &[u8]) {
        if let Some(ethernet) = EthernetPacket::new(data) {
            match ethernet.get_ethertype() {
                EtherType(0x0800) => {
                    // IPv4
                    self.parse_ipv4(ethernet.payload());
                }
                EtherType(0x86DD) => {
                    // IPv6
                    self.parse_ipv6(ethernet.payload());
                }
                _ => {}
            }
        }
    }

    fn parse_ipv4(&mut self, data: &[u8]) {
        if let Some(ip) = Ipv4Packet::new(data) {
            // Update IP counts
            update_map(&mut self.ip_counts, ip.get_source().to_string());
            update_map(&mut self.ip_counts, ip.get_destination().to_string());
        
            let (src_ip, dst_ip) = if ip.get_source() < ip.get_destination() {
                (ip.get_source().to_string(), ip.get_destination().to_string())
            } else {
                (ip.get_destination().to_string(), ip.get_destination().to_string())
            };

            if src_ip != dst_ip {
                let connection_key = (src_ip.clone(), dst_ip.clone()); 

                let connection = self.connections.entry(connection_key).or_insert(Connection {
                    src_ip: src_ip.clone(),
                    dst_ip: dst_ip.clone(),
                    count: 0,
                });
                connection.count += 1;
            }

            match ip.get_next_level_protocol() {
                // Update layer 4 counts
                IpNextHeaderProtocols::Tcp => {
                    update_map(
                        &mut self.layer_4_counts,
                        ip.get_next_level_protocol().to_string(),
                    );
                    self.analyze_tcp(ip.payload());
                }
                IpNextHeaderProtocols::Udp => {
                    update_map(
                        &mut self.layer_4_counts,
                        ip.get_next_level_protocol().to_string(),
                    );
                    self.analyze_udp(ip.payload());
                }
                _ => {
                    update_map(
                        &mut self.layer_4_counts,
                        ip.get_next_level_protocol().to_string(),
                    );
                }
            }
        }
    }

    fn parse_ipv6(&mut self, data: &[u8]) {
        if let Some(ip) = Ipv6Packet::new(data) {
            // Update IP counts
            update_map(&mut self.ip_counts, ip.get_source().to_string());
            update_map(&mut self.ip_counts, ip.get_destination().to_string());
            match ip.get_next_header() {
                IpNextHeaderProtocols::Tcp => {
                    update_map(&mut self.layer_4_counts, ip.get_next_header().to_string());
                    self.analyze_tcp(ip.payload());
                }
                IpNextHeaderProtocols::Udp => {
                    update_map(&mut self.layer_4_counts, ip.get_next_header().to_string());
                    self.analyze_udp(ip.payload());
                }
                _ => {
                    update_map(&mut self.layer_4_counts, ip.get_next_header().to_string());
                }
            }
        }
    }

    fn analyze_tcp(&mut self, data: &[u8]) {
        if let Some(tcp) = TcpPacket::new(data) {
            // Update protocol counts
            if tcp.get_source() < 2048 {
                update_map(
                    &mut self.protocol_counts,
                    get_tcp_service(tcp.get_source()).to_string(),
                );
            }
            if tcp.get_destination() < 2048 {
                update_map(
                    &mut self.protocol_counts,
                    get_tcp_service(tcp.get_destination()).to_string(),
                );
            }
        }
    }

    fn analyze_udp(&mut self, data: &[u8]) {
        if let Some(udp) = UdpPacket::new(data) {
            // Update protocol counts
            if udp.get_source() < 2048 {
                update_map(
                    &mut self.protocol_counts,
                    get_udp_service(udp.get_source()).to_string(),
                );
            }
            if udp.get_destination() < 2048 {
                update_map(
                    &mut self.protocol_counts,
                    get_udp_service(udp.get_destination()).to_string(),
                );
            }
        }
    }
}
