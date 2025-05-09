///
/// ChargeStatus.swift
/// This file was generated by nitrogen. DO NOT MODIFY THIS FILE.
/// https://github.com/mrousavy/nitro
/// Copyright © 2025 Marc Rousavy @ Margelo
///

/**
 * Represents the JS union `ChargeStatus`, backed by a C++ enum.
 */
public typealias ChargeStatus = margelo.nitro.cloudpayments.ChargeStatus

public extension ChargeStatus {
  /**
   * Get a ChargeStatus for the given String value, or
   * return `nil` if the given value was invalid/unknown.
   */
  init?(fromString string: String) {
    switch string {
      case "Completed":
        self = .completed
      case "Authorized":
        self = .authorized
      case "Declined":
        self = .declined
      case "ThreeDS":
        self = .threeds
      default:
        return nil
    }
  }

  /**
   * Get the String value this ChargeStatus represents.
   */
  var stringValue: String {
    switch self {
      case .completed:
        return "Completed"
      case .authorized:
        return "Authorized"
      case .declined:
        return "Declined"
      case .threeds:
        return "ThreeDS"
    }
  }
}
