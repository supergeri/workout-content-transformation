import {
  Rocket,
  Globe,
  Smartphone,
  Watch,
  Activity,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export interface HelpSection {
  id: string;
  title: string;
  icon: LucideIcon;
  content: string;
  screenshots: string[];
}

export const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    content: `
## What is AmakaFlow?

AmakaFlow transforms workout videos from YouTube, TikTok, and Instagram into structured workouts you can follow on your Apple Watch or Garmin device.

### How It Works

1. **Import** - Paste a workout video URL and our AI extracts the exercises
2. **Review** - Check and customize the workout structure, rest periods, and exercise details
3. **Sync** - Send the workout to your Apple Watch or Garmin device
4. **Execute** - Follow along with guided prompts on your wrist

### Platform Overview

| Platform | What It Does |
|----------|--------------|
| **Web App** | Import workouts, edit exercises, manage your library, sync to devices |
| **iPhone App** | Browse synced workouts, remote control, start workouts on Watch |
| **Apple Watch** | Follow guided workouts with haptic feedback |
| **Garmin** | Run synced workouts on supported Garmin devices |

### Getting Help

If you run into any issues, check the [Troubleshooting](#troubleshooting) section or contact us at **support@amakaflow.com**.
    `,
    screenshots: [],
  },
  {
    id: "web-app",
    title: "Web App",
    icon: Globe,
    content: `
## Web App Guide

The AmakaFlow web app at **amakaflow.com** is where you import, edit, and manage your workouts.

---

### Importing Workouts

#### Supported Sources

| Platform | URL Format | Best For |
|----------|------------|----------|
| YouTube | youtube.com/watch?v=... | Full workout videos, tutorials |
| TikTok | tiktok.com/@user/video/... | Quick workout clips |
| Instagram | instagram.com/reel/... | Reels and video posts |

#### How to Import

**Single Import:**
1. From the home screen, click **Import** in the sidebar
2. You'll see the import screen - click **Add URL**
3. Paste a YouTube, TikTok, or Instagram workout URL
4. The URL appears in your sources list
5. Click **Extract Workout** and wait for AI analysis (30-60 seconds)
6. Review the extracted workout with all exercises

**Bulk Import:**
1. Go to **Import** > **Bulk Import**
2. Paste multiple URLs (one per line) or upload a text file
3. Click **Start Import**
4. Review each extracted workout

**Tips for Best Results:**
- Choose videos with clear exercise demonstrations
- Videos with on-screen text work best
- Longer videos (10-60 minutes) typically extract more accurately

---

### Managing Your Library

Access your workouts from **My Workouts** in the sidebar:

- **All Workouts** - Everything in your library
- **Favorites** - Starred workouts for quick access
- **Recent** - Recently imported or edited
- **Activity History** - View completed workout history

---

### Editing a Workout

Click any workout to open the editor:

**Workout Settings:**
- Edit the workout name and description
- Set default rest period between exercises
- Configure warm-up options for strength exercises

**Exercise Settings:**
- Edit exercise name
- Set sets and reps (strength) or duration (timed)
- Configure rest periods between exercises
- Set distance for cardio exercises

**Adding Exercises:**
- Click **Add Exercise** to add new exercises
- Search the wger exercise database for exercises with instructions

---

### Syncing to Devices

#### Apple Watch (via iPhone)

1. Click **Export** on your completed workout
2. Go to **Settings** > **Manage iOS Devices**
3. Click **Generate Pairing Code** to show a QR code
4. Scan the QR code with the AmakaFlow iPhone app
5. Once paired, you'll see a success confirmation
6. Your workouts now sync automatically to paired devices

#### Garmin Connect

1. Go to **Settings** > **Garmin** in the web app
2. Click **Connect Garmin Account**
3. Sign in to Garmin Connect and authorize
4. Sync workouts via **Export** > **Sync to Garmin**

#### Garmin USB Transfer

For devices without cloud sync:
1. Click **Export** > **Garmin FIT File**
2. Connect your Garmin via USB
3. Copy the .FIT file to \`GARMIN/WORKOUTS\` folder
    `,
    screenshots: [
      "web-homescreen-import.png",
      "web-import-start.png",
      "web-import-add-url.png",
      "web-import-url-added.png",
      "web-import-success.png",
      "web-my-workouts.png",
      "web-activity-history.png",
      "web-edit-workout.png",
      "web-edit-exercise.png",
      "web-edit-duration.png",
      "web-add-exercise.png",
      "web-sync-ready.png",
      "web-manage-devices.png",
      "web-qr-pairing.png",
      "web-pairing-success.png",
      "web-export-destinations.png",
    ],
  },
  {
    id: "iphone-app",
    title: "iPhone App",
    icon: Smartphone,
    content: `
## iPhone App Guide

The AmakaFlow iOS app is your companion for browsing workouts and controlling your Apple Watch.

---

### Installing via TestFlight

AmakaFlow for iOS is currently in beta via Apple's TestFlight.

**Step 1: Get the Invitation**
- You'll receive an email invitation to join the beta
- Click the **View in TestFlight** link in the email

**Step 2: Install TestFlight**
1. If you don't have TestFlight, the App Store will open
2. Tap **Get** to install TestFlight

**Step 3: Install AmakaFlow**
1. Open **TestFlight** from the invitation link
2. Find **AmakaFlow** in the available apps
3. Tap **Install** to download the app

**Getting Updates:**
- TestFlight notifies you when updates are available
- Beta builds expire after 90 days - keep updated!

---

### Pairing with the Web App

To sync workouts from amakaflow.com:

1. Open the AmakaFlow iOS app
2. Go to **Settings** tab
3. Tap **Pair with Web**
4. Your iPhone camera opens to scan the QR code
5. Scan the QR code shown on the web app (Settings > Manage iOS Devices)
6. You'll see the connection details once paired successfully

Once paired, your devices stay connected and workouts sync automatically.

---

### App Features

#### Home Screen
- View all synced workouts
- Quick-start recent workouts with the play button
- Search your library

#### Workout Preview
- Tap any workout to see all exercises
- View sets, reps, and durations
- See the full workout breakdown before starting
- Tap **Start on Watch** to begin

#### Activity History
- View completed workouts in the Activity tab
- See all your past workout sessions
- Tap any session to view detailed workout stats
- Track your progress over time

---

### Apple Watch Connection

#### Setting Up Your Watch
- Go to **Settings** in the iOS app
- The Apple Watch section shows your connection status
- Ensure your Watch is paired with your iPhone
- Workouts sync automatically to your Watch

#### Starting a Workout
1. Select a workout from the iOS app
2. Tap **Quick Start** or **Start on Watch**
3. The workout launches on your Apple Watch
4. Your iPhone shows the "waiting for watch" screen

#### Remote Control
During a workout on Apple Watch, your iPhone becomes a remote control:
- See the current exercise and timer
- View warm-up and rest periods
- Skip to next/previous exercise
- Pause and resume the workout
- End workout early if needed
    `,
    screenshots: [
      "testflight-email.png",
      "testflight-install.png",
      "testflight-amakaflow.png",
      "ios-qr-scan.png",
      "ios-connection-details.png",
      "ios-home.png",
      "ios-workout-preview.png",
      "ios-quickstart.png",
      "ios-activity-list.png",
      "ios-workout-details.png",
      "ios-watch-settings.png",
      "ios-waiting-watch.png",
      "ios-remote-warmup.png",
      "ios-remote-rest.png",
    ],
  },
  {
    id: "apple-watch",
    title: "Apple Watch",
    icon: Watch,
    content: `
## Apple Watch Guide

The AmakaFlow Watch app guides you through workouts with on-wrist prompts and haptic feedback.

---

### Starting a Workout

**From iPhone:**
1. Open the AmakaFlow iOS app
2. Select a workout
3. Tap **Start on Watch**
4. The workout begins automatically on your Watch

**From Apple Watch:**
1. Open **AmakaFlow** on your Watch (find it in your app list)
2. The app shows your synced workouts
3. Scroll through and tap a workout to see details
4. Tap **Start** to begin with a countdown

---

### During a Workout

#### Exercise Screen
- **Exercise name** at the top
- **Sets/Reps** or **Duration** in the center
- **Progress indicator** showing completion
- Timer counting your exercise time

#### Navigation
- **Swipe right** → Previous exercise
- **Swipe left** → Next exercise
- **Tap** → Mark set complete (strength mode)
- **Crown** → Scroll through details

#### Rest Timer
Between exercises you'll see:
- Countdown timer showing rest remaining
- Next exercise preview
- Tap to skip rest early

#### Haptic Feedback
Your watch vibrates to notify you:
- Exercise starting
- Rest period ending
- Set complete
- Workout complete

---

### Workout Modes

#### Strength Mode
Best for weight training and bodyweight exercises.
- Exercises show **Sets × Reps** (e.g., "3 sets × 10 reps")
- Tap to mark each set complete
- Rest timer between sets
- Move to next exercise after all sets done

#### Timed Mode
Best for HIIT, circuits, yoga, and cardio.
- Exercises show **Duration** (e.g., "30 seconds")
- Countdown timer runs automatically
- Auto-advances to next exercise
- Haptic alert when time's up

AmakaFlow auto-detects the best mode, but you can override in workout settings.

---

### Watch Remote Features

The Watch can also act as a remote display showing:
- Current exercise details
- Pause/End workout controls
- Exercise progress even when disconnected from iPhone

If the watch loses connection to iPhone, you'll see a disconnected indicator but can continue the workout.

---

### Completing a Workout

When finished:
1. Summary screen shows total time and exercises
2. Heart rate data (if available)
3. Tap **Done** to save

**Ending Early:**
1. Use the pause/end controls
2. Tap **End Workout**
3. Partial workout is saved
    `,
    screenshots: [
      "watch-app-list.png",
      "watch-native-app.png",
      "watch-countdown.png",
      "watch-warmup.png",
      "remote-exercise.png",
      "remote-warmup.png",
      "remote-pause.png",
      "remote-end.png",
      "remote-disconnected.png",
    ],
  },
  {
    id: "garmin",
    title: "Garmin",
    icon: Activity,
    content: `
## Garmin Guide

AmakaFlow supports Garmin fitness watches for guided workouts.

---

### Supported Devices

#### Garmin Connect Sync (Recommended)
- Forerunner 245, 255, 265, 745, 945, 955, 965
- Fenix 5, 6, 7 series
- Epix series
- Venu, Venu 2, Venu 3
- Enduro series

#### USB Transfer Only
- Forerunner 45, 55, 235
- Vivoactive 3, 4
- Older Fenix models

---

### Garmin Connect Integration

#### Connecting Your Account

1. Go to **Settings** in the AmakaFlow web app
2. Click **Connect Garmin**
3. Sign in to your Garmin Connect account
4. Authorize AmakaFlow access

#### Syncing a Workout

1. Open a workout in AmakaFlow
2. Click **Sync to Garmin**
3. Workout uploads to Garmin Connect
4. Open **Garmin Connect Mobile** on your phone
5. Sync your watch to download the workout

---

### USB Transfer Method

For devices without cloud sync:

**Step 1: Export the Workout**
1. Open workout in AmakaFlow
2. Click **Export** > **Garmin FIT**
3. Download the .FIT file

**Step 2: Transfer to Device**
1. Connect Garmin to computer via USB
2. Wait for it to appear as a drive
3. Copy the .FIT file to \`GARMIN/WORKOUTS\` folder
4. Safely eject the device

---

### Running a Workout on Garmin

1. From watch face, press **Start**
2. Select your activity type (e.g., Strength)
3. Press **Menu** (hold middle button)
4. Select **Training** > **Workouts**
5. Choose your AmakaFlow workout
6. Press **Start** to begin

**During the Workout:**
- Screen shows current exercise
- Rep/set count or duration
- Press **Lap** to advance
- Press **Stop** twice to end
    `,
    screenshots: [],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: HelpCircle,
    content: `
## Troubleshooting

### Web App Issues

#### "Failed to extract workout"
- Video may be private, region-restricted, or unsupported
- Try a different video URL
- Ensure the video is publicly accessible

#### "No exercises detected"
- AI couldn't identify exercises in the video
- Choose videos with clear demonstrations
- Videos with on-screen text work better

#### Import is taking too long
- Long videos take more time (up to 2 minutes)
- If stuck, refresh and try again

---

### iPhone App Issues

#### QR pairing not working
1. Ensure both devices are on the same network
2. Check camera permissions for the iOS app
3. Try regenerating the QR code
4. Restart both apps

#### Workouts not syncing
1. Pull down to refresh in the iOS app
2. Check your internet connection
3. Try disconnecting and reconnecting in Settings

---

### Apple Watch Issues

#### Workouts not appearing on Watch
1. Ensure iPhone and Watch are connected
2. Open iOS app and pull down to refresh
3. Check workout shows "Synced" status
4. Restart the Watch app if needed

#### App crashes during workout
1. Force close (press side button, swipe up)
2. Restart your Apple Watch
3. Reinstall via TestFlight if it persists

#### Exercises not advancing
- **Strength mode**: Tap to mark set complete
- **Timed mode**: Should auto-advance (check haptics are on)
- Swipe left to manually advance

---

### Garmin Issues

#### Sync fails
1. Check Garmin Connect connection in Settings
2. Ensure your Garmin account is properly linked
3. Try disconnecting and reconnecting
4. Use USB transfer as backup

#### Workout not on device
1. Open Garmin Connect Mobile app
2. Sync your watch manually
3. Check the workout appears in Garmin Connect first

---

### TestFlight Issues

#### "Build expired" error
- Beta builds expire after 90 days
- Check TestFlight for a newer version

#### Not receiving updates
1. Open TestFlight app
2. Check for available updates
3. Enable notifications for TestFlight

---

### Contact Support

Still having issues?

**Email:** support@amakaflow.com

Please include:
- Device model and OS version
- Description of the issue
- Steps to reproduce
- Screenshots if possible
    `,
    screenshots: [],
  },
];

export const supportEmail = "support@amakaflow.com";
