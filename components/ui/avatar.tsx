import * as AvatarPrimitive from "@rn-primitives/avatar";
import * as React from "react";
import { cn } from "~/lib/utils";

const AvatarPrimitiveRoot = AvatarPrimitive.Root;
const AvatarPrimitiveImage = AvatarPrimitive.Image;
const AvatarPrimitiveFallback = AvatarPrimitive.Fallback;

const Avatar = React.forwardRef<
	AvatarPrimitive.RootRef,
	AvatarPrimitive.RootProps
>(({ className, ...props }, ref) => (
	<AvatarPrimitiveRoot
		className={cn(
			"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
			className,
		)}
		ref={ref}
		{...props}
	/>
));
Avatar.displayName = AvatarPrimitiveRoot.displayName;

const AvatarImage = React.forwardRef<
	AvatarPrimitive.ImageRef,
	AvatarPrimitive.ImageProps
>(({ className, ...props }, ref) => (
	<AvatarPrimitiveImage
		className={cn("aspect-square h-full w-full", className)}
		ref={ref}
		{...props}
	/>
));
AvatarImage.displayName = AvatarPrimitiveImage.displayName;

const AvatarFallback = React.forwardRef<
	AvatarPrimitive.FallbackRef,
	AvatarPrimitive.FallbackProps
>(({ className, ...props }, ref) => (
	<AvatarPrimitiveFallback
		className={cn(
			"flex h-full w-full items-center justify-center rounded-full bg-muted",
			className,
		)}
		ref={ref}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitiveFallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
