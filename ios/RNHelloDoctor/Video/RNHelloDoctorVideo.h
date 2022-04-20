//
//  RNHelloDoctorVideo.h
//  RNHelloDoctor
//
//  Created by HelloDoctor on 4/19/22.
//

#ifndef RNHelloDoctorVideo_h
#define RNHelloDoctorVideo_h

#import <PushKit/PushKit.h>

@interface RNHelloDoctorVideo : NSObject
+ (void)configure:(NSString *)appName;

// --- RNHelloDoctorVideoDelegate helper methods
+ (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type;
+ (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type;
+ (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion;

@end
#endif /* RNHelloDoctorVideo_h */
