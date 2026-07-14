package entitlements

import "testing"

func TestScanProfiles(t *testing.T) {
	guest := FreeProfile(TierGuest, 3)
	if guest.Tier != TierGuest || guest.DetailLevel != DetailSummary || guest.AIIterations != 3 || guest.PDFEnabled || guest.ScreenshotsEnabled {
		t.Fatalf("guest profile = %#v, want restrictive summary profile", guest)
	}

	free := FreeProfile(TierFree, 3)
	if free.Tier != TierFree || free.IsFull() {
		t.Fatalf("free profile = %#v, want non-full account profile", free)
	}

	paid := PaidProfile(10)
	if paid.Tier != TierPaid || paid.DetailLevel != DetailFull || paid.AIIterations != 10 || !paid.PDFEnabled || !paid.ScreenshotsEnabled || !paid.IsFull() {
		t.Fatalf("paid profile = %#v, want full artifact profile", paid)
	}

	legacy := LegacyFullProfile()
	if legacy.Tier != TierLegacyFull || !legacy.IsFull() || !legacy.PDFEnabled || !legacy.ScreenshotsEnabled {
		t.Fatalf("legacy profile = %#v, want preserved full artifacts", legacy)
	}
}

func TestInvalidFreeProfileInputsUseRestrictiveDefaults(t *testing.T) {
	profile := FreeProfile("paid", 0)
	if profile.Tier != TierFree || profile.AIIterations != 3 || profile.PDFEnabled || profile.ScreenshotsEnabled {
		t.Fatalf("profile = %#v, want restrictive defaults", profile)
	}
}
