package com.yg.rnsketchcanvas;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.gson.Gson;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

class ImageData {
    public ImageData(String name, Long dateAdded, String desc, int size) {
        displayName = name;
        dateAddedMilliseconds = dateAdded;
        description = desc;
        fileSize = size;
    }

    public String displayName;

    public Long dateAddedMilliseconds;

    public String description;

    public int fileSize;
}

public class MediaStoreModule {
    private Context mContext;
    private static MediaStoreModule mInstance;

    MediaStoreModule(ReactApplicationContext context) {
        mContext = context.getApplicationContext();
    }

    private MediaStoreModule(Context appContext) {
        this.mContext = appContext;
    }

    public static MediaStoreModule getInstance(Context appContext) {
        if (mInstance == null) {
            mInstance = new MediaStoreModule(appContext);
        }
        return mInstance;
    }

    public String getName() {
        return "MediaStoreModule";
    }

    public String saveFile(String filename, Bitmap image, String formatExt) {
        ContentResolver resolver = mContext.getContentResolver();

        Uri imageCollection = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
                ? MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                : MediaStore.Images.Media.EXTERNAL_CONTENT_URI;

        ContentValues newImageDetails = new ContentValues();
        newImageDetails.put(MediaStore.Images.Media.DISPLAY_NAME, filename);
        newImageDetails.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
        Uri newImageUri = resolver.insert(imageCollection, newImageDetails);

        try (OutputStream stream = resolver.openOutputStream(newImageUri)) {
            Bitmap.CompressFormat format = formatExt.equals("png")
                ? Bitmap.CompressFormat.PNG
                : Bitmap.CompressFormat.JPEG;
            int quality = formatExt.equals("png") ? 100 : 90;

            image.compress(format, quality, stream);

            return newImageUri.toString();
        } catch (IOException | NullPointerException ex) {
            Log.e("SketchCanvas", ex.toString());
            return "";
        }
    }

    public void getFiles(Promise promise) {
        String[] projection = null; // new String[] { MediaStore.Images.Media.DISPLAY_NAME };
        String selection = null; // String.format(Locale.US,
//                "%s = %d",
//                MediaStore.Files.FileColumns.MEDIA_TYPE,
//                MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE);
        String[] selectionArgs = null; // new String[] {  };
        String sortOrder = null;

        Cursor cursor = mContext.getContentResolver().query(
            MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
            projection,
            selection,
            selectionArgs,
            sortOrder
        );

        List<ImageData> results = new ArrayList<>();
        while (cursor.moveToNext()) {
            ImageData imgData = new ImageData(
                cursor.getString(cursor.getColumnIndex(MediaStore.Images.ImageColumns.DISPLAY_NAME)),
                cursor.getLong(cursor.getColumnIndex(MediaStore.Images.ImageColumns.DATE_ADDED)) * 1000,
                cursor.getString(cursor.getColumnIndex(MediaStore.Images.ImageColumns.DESCRIPTION)),
                cursor.getInt(cursor.getColumnIndex(MediaStore.Images.ImageColumns.SIZE))
            );
            results.add(imgData);
        }

        promise.resolve(new Gson().toJson(results));
    }
}
