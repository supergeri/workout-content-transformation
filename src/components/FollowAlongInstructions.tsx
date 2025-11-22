import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { HelpCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function FollowAlongInstructions() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          About Follow-Along Links
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-h-[90vh] overflow-y-auto p-6 relative"
        style={{ maxWidth: '90vw', width: '90vw' }}
      >
        <DialogHeader className="pr-8">
          <DialogTitle>Follow-Along Video Links</DialogTitle>
          <DialogDescription>
            Learn how to add video links to your workout exercises
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 pr-12">
          <div>
            <h3 className="text-lg font-semibold mb-2">What are Follow-Along Links?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Follow-along links allow you to attach video demonstrations to specific exercises in your workout. 
              When you're performing the workout, you can quickly access the video to see proper form and technique.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Supported platforms:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 space-y-1">
              <li>Instagram posts and reels</li>
              <li>TikTok videos</li>
              <li>YouTube videos</li>
              <li>Any publicly accessible video URL</li>
            </ul>
          </div>

          <Alert className="max-w-full">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <AlertTitle>Why We Can't Self-Edit Instagram Videos</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">
                  Instagram videos cannot be directly edited or processed within our application due to several technical and legal limitations:
                </p>
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="font-medium text-sm mb-1">API Restrictions</p>
                    <p className="text-xs text-muted-foreground">
                      Instagram's API does not provide access to download or edit video content. 
                      We can only extract metadata (thumbnails, captions) but not the actual video files.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Terms of Service</p>
                    <p className="text-xs text-muted-foreground">
                      Instagram's Terms of Service prohibit downloading, modifying, or redistributing 
                      user content without explicit permission from the content creator.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Copyright Protection</p>
                    <p className="text-xs text-muted-foreground">
                      Videos on Instagram are protected by copyright. Editing or processing them 
                      would require permission from the original creator.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Technical Limitations</p>
                    <p className="text-xs text-muted-foreground">
                      Instagram videos are served through their CDN with authentication tokens 
                      that expire quickly, making it difficult to reliably access and process the video content.
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="font-medium text-sm mb-1">Privacy & Security</p>
                  <p className="text-xs text-muted-foreground">
                    Instagram implements measures to prevent unauthorized access to video content 
                    to protect user privacy and intellectual property.
                  </p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg mt-3">
                  <p className="font-medium text-sm mb-2">
                    Instead, we store the link to the Instagram post so you can:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                    <li>Open the original post in Instagram to view the video</li>
                    <li>Follow along with the original creator's content</li>
                    <li>Support the content creator by viewing on their platform</li>
                    <li>Access the video with all its original context (comments, captions, etc.)</li>
                  </ul>
                </div>
              </AlertDescription>
            </div>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How to Add Follow-Along Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">1. While Creating a Workout</h4>
                  <p className="text-sm text-muted-foreground">
                    When editing an exercise in the Structure step, you'll see a "Follow-Along Video URL" field. 
                    Paste your Instagram, TikTok, or YouTube link there.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">2. From Workout History</h4>
                  <p className="text-sm text-muted-foreground">
                    Open any workout from your history, click the edit icon next to any exercise, 
                    and add or update the follow-along URL.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">3. Supported URL Formats</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Instagram: <code className="bg-muted px-1 rounded text-xs">instagram.com/p/...</code></li>
                    <li>TikTok: <code className="bg-muted px-1 rounded text-xs">tiktok.com/@user/video/...</code></li>
                    <li>YouTube: <code className="bg-muted px-1 rounded text-xs">youtube.com/watch?v=...</code></li>
                    <li>Any video URL that opens in a browser</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Use links to videos that demonstrate the specific exercise</p>
                <p>• Ensure the video is publicly accessible (not private)</p>
                <p>• Test the link before saving to make sure it works</p>
                <p>• Consider using shorter videos for quick reference during workouts</p>
                <p>• Respect content creators' rights and terms of service</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" asChild>
              <a
                href="https://help.instagram.com/519522125107875"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                Instagram Help <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

