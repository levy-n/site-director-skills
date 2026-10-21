// RiveStage.kt - rive-studio starter: one Rive piece in Jetpack Compose with the app.rive API.
// Gradle (Kotlin DSL): implementation("app.rive:rive-android:11.14.1")   // check Maven Central for the latest
// Init once before any Rive call: Rive.init(context) in Application.onCreate, or the androidx.startup RiveInitializer.
// Signatures follow the API reference at api-docs.rive.app (package app.rive, the Compose API that Rive labels
// Beta but recommends for new Compose code). Some docs pages still show setNumberProperty / numberPropertyFlow;
// the reference names are setNumber / getNumberFlow. If the compiler disagrees, check the reference for your version.
// Names come from the piece's contract (design/rive/<piece>/CONTRACT.md).
package com.example.rive // REPLACE

import android.provider.Settings
import android.util.Log
import androidx.annotation.RawRes
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.LayoutDirection
import app.rive.Fit
import app.rive.Result
import app.rive.Rive
import app.rive.RiveFileSource
import app.rive.ViewModelInstance
import app.rive.rememberRiveFile
import app.rive.rememberRiveWorker
import app.rive.rememberViewModelInstance

private const val TAG = "RiveStage"

/**
 * One Rive piece with a reserved box, accessibility, RTL and reduced motion.
 * Set app-to-Rive properties in [bind]; it re-runs whenever [bindKey] changes.
 * Pass [contentDescription] = null for a decorative piece (hidden from TalkBack).
 */
@Composable
fun RiveStage(
    @RawRes res: Int,
    modifier: Modifier = Modifier,
    aspectRatio: Float = 1f,
    contentDescription: String? = null,
    fit: Fit = Fit.Contain(),
    pauseWhenReduced: Boolean = false, // only for files without a prefersReducedMotion property
    bindKey: Any? = null,
    bind: (ViewModelInstance) -> Unit = {},
) {
    val context = LocalContext.current
    val worker = rememberRiveWorker()
    val file = rememberRiveFile(RiveFileSource.RawRes(res, context.resources), worker)
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    // Animator duration scale 0 ("Remove animations" in accessibility settings) is Android's reduced-motion signal.
    val reduced = remember {
        Settings.Global.getFloat(context.contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f) == 0f
    }
    val a11y = if (contentDescription == null) Modifier.clearAndSetSemantics { }
    else Modifier.semantics { this.contentDescription = contentDescription }

    // The box is reserved before the file loads, so the layout never shifts.
    Box(modifier.fillMaxWidth().aspectRatio(aspectRatio).then(a11y)) {
        when (file) {
            is Result.Loading -> Unit
            is Result.Error -> LaunchedEffect(file) { Log.w(TAG, "Rive file failed to load", file.throwable) }
            is Result.Success -> {
                val vmi = rememberViewModelInstance(file.value) // the artboard's default view model and instance
                LaunchedEffect(vmi, rtl, reduced, bindKey) {
                    // Optional contract properties: a file without them simply ignores the call.
                    runCatching { vmi.setBoolean("isRtl", rtl) }
                    runCatching { vmi.setBoolean("prefersReducedMotion", reduced) }
                    bind(vmi)
                }
                Rive(
                    file = file.value,
                    modifier = Modifier.fillMaxSize(),
                    viewModelInstance = vmi,
                    fit = fit,
                    playing = !(reduced && pauseWhenReduced),
                )
            }
        }
    }
}

// Usage:
// RiveStage(
//     res = R.raw.mascot,
//     contentDescription = stringResource(R.string.mascot_label),
//     bindKey = answer,
//     bind = { vmi ->
//         vmi.setEnum("mood", if (answer.correct) "happy" else "concerned")
//         if (answer.correct) vmi.fireTrigger("celebrate")
//     },
// )
// Rive-to-app and a haptic tick on the impact frame (a trigger the file fires), inside a wrapper with access to vmi:
// val haptics = LocalHapticFeedback.current
// LaunchedEffect(vmi) { vmi.getTriggerFlow("impact").collect { haptics.performHapticFeedback(HapticFeedbackType.LongPress) } }
// Observe a value: val score by vmi.getNumberFlow("score").collectAsState(initial = 0f)
