package compliance

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
)

//go:embed fines.json
var finesJSON []byte

type FineEntry struct {
	CheckName  string   `json:"check_name"`
	CheckIDs   []string `json:"check_ids"`
	MaxFineRub struct {
		PhysicalPerson int `json:"physical_person"`
		LegalEntity    int `json:"legal_entity"`
	} `json:"max_fine_rub"`
}

type FineCatalog struct {
	Checks []FineEntry `json:"checks"`
}

type FineEstimate struct {
	PhysicalPerson int `json:"physical_person"`
	LegalEntity    int `json:"legal_entity"`
}

func Catalog() (FineCatalog, error) {
	var catalog FineCatalog
	if err := json.Unmarshal(finesJSON, &catalog); err != nil {
		return FineCatalog{}, fmt.Errorf("parse fines catalog: %w", err)
	}
	return catalog, nil
}

func Estimate(results []store.Result) FineEstimate {
	catalog, err := Catalog()
	if err != nil {
		return FineEstimate{}
	}

	byID := map[string]FineEntry{}
	for _, entry := range catalog.Checks {
		for _, id := range entry.CheckIDs {
			byID[id] = entry
		}
	}

	estimate := FineEstimate{}
	for _, result := range results {
		entry, ok := byID[result.ID]
		if !ok {
			continue
		}
		switch strings.ToLower(result.Result) {
		case "fail":
			estimate.PhysicalPerson += entry.MaxFineRub.PhysicalPerson
			estimate.LegalEntity += entry.MaxFineRub.LegalEntity
		case "warn":
			estimate.PhysicalPerson += entry.MaxFineRub.PhysicalPerson / 2
			estimate.LegalEntity += entry.MaxFineRub.LegalEntity / 2
		}
	}
	return estimate
}
