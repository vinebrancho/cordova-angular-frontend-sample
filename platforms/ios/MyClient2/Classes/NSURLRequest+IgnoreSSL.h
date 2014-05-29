//
//  NSURLRequest+IgnoreSSL.h
//  MyClient2
//
//  Created by Yunchan Cho on 2014. 5. 29..
//
//


@interface NSURLRequest (IgnoreSSL)

+ (BOOL)allowsAnyHTTPSCertificateForHost:(NSString*)host;

@end
