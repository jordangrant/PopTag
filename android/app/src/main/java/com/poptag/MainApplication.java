package com.poptag;

import android.app.Application;

import com.facebook.react.ReactApplication;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import io.codebakery.imagerotate.ImageRotatePackage;
import com.rnfs.RNFSPackage;
import com.jobeso.RNInstagramStoryShare.RNInstagramStorySharePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.brentvatne.react.ReactVideoPackage;
import org.reactnative.camera.RNCameraPackage;
import com.barefootcoders.android.react.KDSocialShare.KDSocialShare;
import com.BV.LinearGradient.LinearGradientPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.jadsonlourenco.RNShakeEvent.RNShakeEventPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ImageResizerPackage(),
            new ImageRotatePackage(),
            new RNFSPackage(),
            new RNInstagramStorySharePackage(),
            new RNFetchBlobPackage(),
            new ReactVideoPackage(),
            new RNCameraPackage(),
            new KDSocialShare(),
            new LinearGradientPackage(),
            new RNSoundPackage(),
            new ReactNativeContacts(),
            new RNViewShotPackage(),
            new RNShakeEventPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
