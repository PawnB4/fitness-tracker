# Fitness Tracker

A modern mobile fitness tracking application built with React Native and Expo, designed to help me track my workouts. It lets you create workout plans, and monitor fitness progress. **100% local storage with no internet connection required** - all your data stays on your device.

## Features

- **Workout Management**: Create, edit, and log workouts
- **Exercise Library**: Browse and add exercises to your workouts
- **Workout Plans**: Create custom workout plans with predefined exercises
- **Progress Tracking**: Monitor your fitness journey over time
- **Offline Support**: All data is stored locally using SQLite
- **Data export**: You can export all of your workout data to a .csv file

## Technology Stack

- **Frontend**: React Native, Expo, Expo Router
- **UI Framework**: NativeWind (Tailwind CSS for React Native)
- **Database**: SQLite with Drizzle ORM
- **State Management**: Tanstack Query
- **Form Validation**: Zod, Tanstack React Form

## Download Instructions

I made this for myself, so the application is currently available for **Android only**. iOS support may be added in the future.

### Android Installation
1. Download the APK file from this [link](https://expo.dev/accounts/pawnb4/projects/fitness-tracker-nw/builds/a6f2168a-93de-4d1c-bf7f-1a17ab1fc9a6)
2. Tap on the downloaded file
3. If prompted about security settings, go to Settings → Allow installation from this source
4. Follow the on-screen instructions to complete installation

**Privacy Note:** This app works entirely offline and stores all data locally on your device. No data is ever sent to any server or third party. Internet permissions are not required for app functionality.

## Project Structure

- `/app`: Main application code and screens
  - `/(tabs)`: Main tab navigation screens
  - `/workout`: Workout creation and editing
  - `/workout-plan`: Workout plan management
  - `/welcome`: Initial screen to set up the user
- `/components`: Reusable UI components
- `/db`: Database configuration and schema
- `/lib`: Utility functions and hooks
- `/assets`: Images, fonts, and other static assets

## Database Schema

The app uses SQLite with Drizzle ORM and includes the following main tables:

- **exercises**: Definition of available exercises
- **workouts**: Logged workout sessions
- **workout_exercises**: Junction table linking exercises to specific workouts
- **workout_plans**: Custom workout plan templates
- **workout_plan_exercises**: Exercises included in workout plans

## Development

### Debugging

The app includes Drizzle Studio integration for database inspection during development.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
