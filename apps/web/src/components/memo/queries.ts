import { gql } from "@apollo/client";

export const GET_MEMO = gql`
  query($id: ID!) {
    item(id: $id) {
      id name path type
      horses {
        name
        predictionMark
        fields { label type value }
      }
    }
  }
`;

export const SET_HORSE_PROP = gql`
  mutation($memoId: ID!, $index: Int!, $name: String, $predictionMark: PredictionMark) {
    setHorseProp(memoId: $memoId, index: $index, name: $name, predictionMark: $predictionMark) {
      id
      horses { name predictionMark fields { label type value } }
    }
  }
`;

export const SET_FIELD_VALUE = gql`
  mutation($memoId: ID!, $index: Int!, $label: String!, $type: FieldType!, $value: JSON) {
    setHorseFieldValue(memoId: $memoId, index: $index, label: $label, type: $type, value: $value) {
      id
      horses { name predictionMark fields { label type value } }
    }
  }
`;

export const ADD_FIELD_TO_MEMO = gql`
  mutation($memoId: ID!, $label: String!, $type: FieldType!) {
    addFieldToMemo(memoId: $memoId, label: $label, type: $type) {
      id
      horses { name predictionMark fields { label type value } }
    }
  }
`;