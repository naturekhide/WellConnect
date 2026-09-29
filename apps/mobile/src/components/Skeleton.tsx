import { useEffect, useRef } from "react";
import { Animated, Platform } from "react-native";
import { useColors, radius } from "../theme";

export default function Skeleton({ width, height, style }: { width?: any; height?: number; style?: any }) {
    var colors = useColors();
    var opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(function () {
        var useNative = Platform.OS !== "web";
        var animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: useNative }),
                Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: useNative }),
            ])
        );
        animation.start();
        return function () { animation.stop(); };
    }, []);

    return (
        <Animated.View
            style={[
                {
                    backgroundColor: colors.border,
                    borderRadius: radius.sm,
                    width: width || "100%",
                    height: height || 16,
                    opacity: opacity,
                },
                style,
            ]}
        />
    );
}