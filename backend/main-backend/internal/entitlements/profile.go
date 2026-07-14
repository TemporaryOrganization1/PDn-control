package entitlements

import "time"

const (
	TierGuest      = "guest"
	TierFree       = "free"
	TierPaid       = "paid"
	TierLegacyFull = "legacy_full"

	DetailSummary = "summary"
	DetailFull    = "full"
)

// ScanProfile is an immutable snapshot of the features granted when a scan starts.
type ScanProfile struct {
	Tier               string `json:"tier"`
	DetailLevel        string `json:"detail_level"`
	AIIterations       int    `json:"ai_iterations"`
	PDFEnabled         bool   `json:"pdf_enabled"`
	ScreenshotsEnabled bool   `json:"screenshots_enabled"`
}

func FreeProfile(tier string, iterations int) ScanProfile {
	if tier != TierGuest {
		tier = TierFree
	}
	if iterations <= 0 {
		iterations = 3
	}
	return ScanProfile{
		Tier:         tier,
		DetailLevel:  DetailSummary,
		AIIterations: iterations,
	}
}

func PaidProfile(iterations int) ScanProfile {
	if iterations <= 0 {
		iterations = 10
	}
	return ScanProfile{
		Tier:               TierPaid,
		DetailLevel:        DetailFull,
		AIIterations:       iterations,
		PDFEnabled:         true,
		ScreenshotsEnabled: true,
	}
}

func LegacyFullProfile() ScanProfile {
	profile := PaidProfile(10)
	profile.Tier = TierLegacyFull
	return profile
}

func (p ScanProfile) IsFull() bool {
	return p.Tier == TierPaid || p.Tier == TierLegacyFull
}

// ScanQuota describes the current rolling-window allowance for the caller.
type ScanQuota struct {
	Tier            string     `json:"tier"`
	Limited         bool       `json:"limited"`
	Limit           int        `json:"limit,omitempty"`
	Used            int        `json:"used,omitempty"`
	Remaining       int        `json:"remaining,omitempty"`
	WindowDays      int        `json:"window_days,omitempty"`
	NextAvailableAt *time.Time `json:"next_available_at,omitempty"`
}
