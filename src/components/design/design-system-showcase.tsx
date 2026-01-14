/**
 * Design System Showcase
 * Demo component to visualize all design tokens and components
 * For development reference - can be accessed at /design-system route
 */

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Typography } from './typography-scale';

export function DesignSystemShowcase() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Typography.H1>Sensey Board Design System</Typography.H1>
        <Typography.Lead>
          A comprehensive design system featuring Sakura Pink branding with
          clean, Notion-inspired aesthetics.
        </Typography.Lead>
      </div>

      <Separator />

      {/* Color Palette */}
      <section className="space-y-4">
        <Typography.H2>Color Palette</Typography.H2>

        {/* Primary - Sakura Pink */}
        <Card>
          <CardHeader>
            <CardTitle>Primary - Sakura Pink</CardTitle>
            <CardDescription>
              Main brand color for primary actions and highlights
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <ColorSwatch
              color="bg-primary"
              label="Primary (#FFB7C5)"
              hex="#FFB7C5"
            />
            <ColorSwatch
              color="bg-primary-light"
              label="Light (#FFEEF2)"
              hex="#FFEEF2"
            />
            <ColorSwatch
              color="bg-primary-medium"
              label="Medium (#FFD4E0)"
              hex="#FFD4E0"
            />
          </CardContent>
        </Card>

        {/* Neutral Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Neutral Colors</CardTitle>
            <CardDescription>
              Base colors for backgrounds, text, and borders
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <ColorSwatch
              color="bg-background"
              label="Background (#FFFFFF)"
              hex="#FFFFFF"
              border
            />
            <ColorSwatch
              color="bg-card-background"
              label="Card Background (#F5F5F5)"
              hex="#F5F5F5"
            />
            <ColorSwatch
              color="bg-border"
              label="Border (#E5E5E5)"
              hex="#E5E5E5"
            />
            <ColorSwatch
              color="bg-muted-foreground"
              label="Secondary Text (#737373)"
              hex="#737373"
            />
            <ColorSwatch
              color="bg-foreground"
              label="Primary Text (#171717)"
              hex="#171717"
            />
          </CardContent>
        </Card>

        {/* Semantic Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Semantic Colors</CardTitle>
            <CardDescription>Status and feedback colors</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <ColorSwatch
              color="bg-success"
              label="Success (#22C55E)"
              hex="#22C55E"
            />
            <ColorSwatch
              color="bg-error"
              label="Error (#EF4444)"
              hex="#EF4444"
            />
            <ColorSwatch
              color="bg-warning"
              label="Warning (#F59E0B)"
              hex="#F59E0B"
            />
            <ColorSwatch color="bg-info" label="Info (#3B82F6)" hex="#3B82F6" />
          </CardContent>
        </Card>

        {/* Ticket Type Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Type Colors</CardTitle>
            <CardDescription>
              Badge colors for different ticket types
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <ColorSwatch
              color="bg-ticket-issue"
              label="Issue (Sakura)"
              hex="#FFB7C5"
            />
            <ColorSwatch
              color="bg-ticket-fix"
              label="Fix (Green)"
              hex="#4ADE80"
            />
            <ColorSwatch
              color="bg-ticket-hotfix"
              label="Hotfix (Red)"
              hex="#F87171"
            />
            <ColorSwatch
              color="bg-ticket-problem"
              label="Problem (Yellow)"
              hex="#FBBF24"
            />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Typography Scale */}
      <section className="space-y-4">
        <Typography.H2>Typography Scale</Typography.H2>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Typography.H1>Heading 1 - 36px</Typography.H1>
              <Typography.Muted>Large page headers and titles</Typography.Muted>
            </div>
            <div className="space-y-2">
              <Typography.H2>Heading 2 - 30px</Typography.H2>
              <Typography.Muted>
                Section headers and board titles
              </Typography.Muted>
            </div>
            <div className="space-y-2">
              <Typography.H3>Heading 3 - 24px</Typography.H3>
              <Typography.Muted>
                Subsection headers and card titles
              </Typography.Muted>
            </div>
            <div className="space-y-2">
              <Typography.H4>Heading 4 - 20px</Typography.H4>
              <Typography.Muted>Component headers</Typography.Muted>
            </div>
            <div className="space-y-2">
              <Typography.Paragraph>
                Body text - 16px - Used for standard content and descriptions
              </Typography.Paragraph>
              <Typography.Muted>
                Regular body text with comfortable reading size
              </Typography.Muted>
            </div>
            <div className="space-y-2">
              <Typography.Small>Small text - 14px</Typography.Small>
              <Typography.Muted>
                Used for labels and secondary information
              </Typography.Muted>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Spacing Scale */}
      <section className="space-y-4">
        <Typography.H2>Spacing Scale (4px base)</Typography.H2>
        <Card>
          <CardContent className="space-y-2 pt-6">
            <SpacingDemo size="xs" pixels="4px" />
            <SpacingDemo size="sm" pixels="8px" />
            <SpacingDemo size="md" pixels="12px" />
            <SpacingDemo size="lg" pixels="16px" />
            <SpacingDemo size="xl" pixels="24px" />
            <SpacingDemo size="2xl" pixels="32px" />
            <SpacingDemo size="3xl" pixels="48px" />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Components */}
      <section className="space-y-4">
        <Typography.H2>Component Examples</Typography.H2>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Type Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Badge className="bg-ticket-issue text-white">ISSUE</Badge>
            <Badge className="bg-ticket-fix text-white">FIX</Badge>
            <Badge className="bg-ticket-hotfix text-white">HOTFIX</Badge>
            <Badge className="bg-ticket-problem text-white">PROBLEM</Badge>
          </CardContent>
        </Card>

        {/* Status Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Status Badges</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Badge variant="outline">TODO</Badge>
            <Badge className="bg-info text-info-foreground">IN PROGRESS</Badge>
            <Badge className="bg-warning text-warning-foreground">
              IN REVIEW
            </Badge>
            <Badge className="bg-success text-success-foreground">DONE</Badge>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Shadow Examples */}
      <section className="space-y-4">
        <Typography.H2>Shadows</Typography.H2>
        <div className="grid grid-cols-3 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Card Shadow</CardTitle>
              <CardDescription>Default card elevation</CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-card-hover">
            <CardHeader>
              <CardTitle>Card Hover</CardTitle>
              <CardDescription>Elevated hover state</CardDescription>
            </CardHeader>
          </Card>
          <Card className="shadow-dialog">
            <CardHeader>
              <CardTitle>Dialog Shadow</CardTitle>
              <CardDescription>Heavy dialog shadow</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}

function ColorSwatch({
  color,
  label,
  hex,
  border = false,
}: {
  color: string;
  label: string;
  hex: string;
  border?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={`w-full h-20 rounded-md ${color} ${border ? 'border-2 border-gray-300' : ''}`}
      />
      <div>
        <Typography.Small>{label}</Typography.Small>
        <Typography.Muted className="text-xs">{hex}</Typography.Muted>
      </div>
    </div>
  );
}

function SpacingDemo({ size, pixels }: { size: string; pixels: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32">
        <Typography.Small>
          {size} - {pixels}
        </Typography.Small>
      </div>
      <div className={`h-4 bg-primary rounded`} style={{ width: pixels }} />
    </div>
  );
}
