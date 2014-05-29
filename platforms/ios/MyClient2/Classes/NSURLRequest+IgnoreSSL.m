//
//  NSURLRequest+IgnoreSSL.m
//  MyClient2
//
//  Created by Yunchan Cho on 2014. 5. 29..
//
//

#import "NSURLRequest+IgnoreSSL.h"

@implementation NSURLRequest (IgnoreSSL)

+ (BOOL)allowsAnyHTTPSCertificateForHost:(NSString*)host
{
    
    if ([host hasSuffix:@"ec2-54-199-141-31.ap-northeast-1.compute.amazonaws.com"])
    {
        return YES;
    } else {
        return NO;
    }
}

@end
