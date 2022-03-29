require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name                = "RNHelloDoctor"
  s.version             = package['version']
  s.summary             = "HelloDoctor SDK for React Native"
  s.homepage            = "hellodoctor.mx"
  s.license             = package['license']
  s.author              = "HelloDoctor"
  s.source              = { :git => "github.com/hellodoctordev/mobile.sdk/react-native" }
  s.requires_arc        = true
  s.platform            = :ios, "13.0"
  s.source_files        = "ios/RNHelloDoctor/**/*.{h,m,swift}"
  s.dependency 'React'
  s.dependency 'TwilioVideo', '~> 4.6.1'
end
