/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use client";

import { Fragment, useActionState, useRef, useState } from "react";
import { OnerepProfileRow } from "knex/types/tables";
import { EditProfileCancelDialog } from "./EditProfileCancelDialog";
import {
  EditProfileFormInputs,
  EditProfileInputOnChangeReturnValue,
} from "./EditProfileFormInputs";
import { TelemetryButton } from "../../../../../../../../components/client/TelemetryButton";
import { useL10n } from "../../../../../../../../hooks/l10n";
import styles from "./EditProfileForm.module.scss";
import { onHandleUpdateProfileData } from "#settings/actions";

const profileFields: (keyof OnerepProfileRow)[] = [
  "first_name",
  "middle_name",
  "last_name",
  "date_of_birth",
  "phone_numbers",
  "addresses",
] as const;

type ProfileDataItemKey = keyof Pick<
  OnerepProfileRow,
  "first_name" | "middle_name" | "last_name"
>;

export type ProfileDataListKey = keyof Pick<
  OnerepProfileRow,
  "first_names" | "middle_names" | "last_names" | "phone_numbers" | "addresses"
>;

function EditProfileForm(props: { profileData: OnerepProfileRow }) {
  const l10n = useL10n();
  const [profileFormData, setProfileFormData] = useState(props.profileData);
  const [
    _updateProfileActionError,
    updateProfileAction,
    updateProfileActionIsPending,
  ] = useActionState(async () => {
    await onHandleUpdateProfileData(profileFormData);
  }, null);
  const formRef = useRef<HTMLFormElement>(null);

  const hasProfileDataChanged =
    JSON.stringify(props.profileData) !== JSON.stringify(profileFormData);

  const handleOnInputChange = ({
    key,
    value,
    index,
  }: EditProfileInputOnChangeReturnValue) => {
    const formDataUpdated = { ...profileFormData };
    if (typeof index === "undefined") {
      formDataUpdated[key as ProfileDataItemKey] = value;
    } else {
      const [city, state, _countryCode] = value.split(", ");
      formDataUpdated[key as ProfileDataListKey][index] =
        key === "addresses" ? { city, state } : value;
    }
    setProfileFormData(formDataUpdated);
  };

  const handleOnAdd = (profileDataKey: ProfileDataListKey) => {
    const formDataUpdated = {
      ...profileFormData,
      [profileDataKey]: [...profileFormData[profileDataKey], ""],
    };
    setProfileFormData(formDataUpdated);
  };

  const handleOnRemove = (
    profileDataKey: ProfileDataListKey,
    itemIndex: number,
  ) => {
    const formDataUpdated = {
      ...profileFormData,
      [profileDataKey]: profileFormData[profileDataKey].filter(
        (_, filteIndex) => itemIndex !== filteIndex,
      ),
    };
    setProfileFormData(formDataUpdated);
  };

  return (
    <form
      ref={formRef}
      className={styles.profileForm}
      action={updateProfileAction}
    >
      {profileFields.map((profileDataKey, detailIndex) => {
        const label = l10n.getString(
          `settings-edit-profile-info-form-fieldset-label-${profileDataKey.replaceAll("_", "-")}`,
        );
        return (
          <Fragment key={profileDataKey}>
            <fieldset
              className="noList"
              disabled={updateProfileActionIsPending}
            >
              <legend>
                <span>{label}</span>
              </legend>
              <div className={styles.formInputs}>
                <EditProfileFormInputs
                  profileData={profileFormData}
                  profileDataKey={profileDataKey as keyof OnerepProfileRow}
                  handleOnInputChange={handleOnInputChange}
                  onAdd={handleOnAdd}
                  onRemove={handleOnRemove}
                />
              </div>
            </fieldset>
            {detailIndex < Object.keys(profileFormData).length - 1 && <hr />}
          </Fragment>
        );
      })}
      <div className={styles.profileFormButtons}>
        {hasProfileDataChanged ? (
          <EditProfileCancelDialog
            isSaving={updateProfileActionIsPending}
            onSave={() => {
              formRef.current?.requestSubmit();
            }}
          />
        ) : (
          <TelemetryButton
            variant="secondary"
            href="/user/settings/edit-info"
            event={{
              module: "button",
              name: "click",
              data: {
                button_id: "settings_edit_profile_form_cancel",
              },
            }}
          >
            {l10n.getString(
              "settings-edit-profile-info-form-cancel-button-label",
            )}
          </TelemetryButton>
        )}
        <TelemetryButton
          type="submit"
          variant="primary"
          isLoading={updateProfileActionIsPending}
          disabled={!hasProfileDataChanged}
          event={{
            module: "ctaButton",
            name: "click",
            data: {
              button_id: "settings_edit_profile_form_submitted",
            },
          }}
        >
          {l10n.getString("settings-edit-profile-info-form-save-button-label")}
        </TelemetryButton>
      </div>
    </form>
  );
}

export { EditProfileForm };
